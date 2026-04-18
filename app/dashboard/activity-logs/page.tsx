import { redirect } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Activity, Clock3, FileText, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { ActivityLog, Profile } from '@/lib/types/database'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const metadata = {
  title: 'Logs de Atividade | Wayne Industries',
  description: 'Auditoria e rastreio de eventos administrativos do sistema.',
}

type ActivityLogWithUser = ActivityLog & {
  user?: Pick<Profile, 'full_name' | 'avatar_url' | 'department' | 'role'> | null
}

async function getCurrentProfile(): Promise<{ user: { id: string }, profile: Profile | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile: profile as Profile | null }
}

async function getActivityLogs(): Promise<ActivityLogWithUser[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      id,
      user_id,
      action,
      resource_type,
      resource_id,
      details,
      created_at,
      user:profiles(full_name, avatar_url, department, role)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching activity logs:', error)
    return []
  }

  return (data ?? []) as ActivityLogWithUser[]
}

const actionLabels: Record<string, string> = {
  create: 'Criacao',
  update: 'Atualizacao',
  delete: 'Exclusao',
  view: 'Visualizacao',
}

const resourceLabels: Record<string, string> = {
  equipment: 'Equipamento',
  vehicle: 'Veiculo',
  vehicles: 'Veiculos',
  security_device: 'Dispositivo',
  security_devices: 'Dispositivos',
  profile: 'Perfil',
  profiles: 'Usuarios',
  restricted_area: 'Area restrita',
  access_log: 'Acesso',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getActionVariant(action: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (action) {
    case 'create':
      return 'default'
    case 'update':
      return 'secondary'
    case 'delete':
      return 'destructive'
    default:
      return 'outline'
  }
}

function getActionLabel(action: string) {
  return actionLabels[action] || action.charAt(0).toUpperCase() + action.slice(1)
}

function getResourceLabel(resourceType: string) {
  return resourceLabels[resourceType] || resourceType.replace(/_/g, ' ')
}

function getDetailsSummary(details: Record<string, unknown> | null) {
  if (!details || Object.keys(details).length === 0) {
    return 'Sem detalhes adicionais'
  }

  const priorityKeys = ['name', 'status', 'location', 'type', 'department', 'reason']
  const picked = priorityKeys
    .filter((key) => key in details)
    .slice(0, 3)
    .map((key) => `${key}: ${String(details[key])}`)

  if (picked.length > 0) {
    return picked.join(' | ')
  }

  return JSON.stringify(details)
}

export default async function ActivityLogsPage() {
  const [logs, { profile }] = await Promise.all([
    getActivityLogs(),
    getCurrentProfile(),
  ])

  const canManage = profile?.role === 'manager' || profile?.role === 'admin'

  if (!canManage) {
    redirect('/dashboard')
  }

  const now = Date.now()
  const last24Hours = logs.filter((log) => now - new Date(log.created_at).getTime() <= 24 * 60 * 60 * 1000).length
  const createCount = logs.filter((log) => log.action === 'create').length
  const deleteCount = logs.filter((log) => log.action === 'delete').length

  const topResourceEntry = Object.entries(
    logs.reduce<Record<string, number>>((acc, log) => {
      acc[log.resource_type] = (acc[log.resource_type] || 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])[0]

  const topResourceLabel = topResourceEntry
    ? `${getResourceLabel(topResourceEntry[0])} (${topResourceEntry[1]})`
    : 'Sem dados'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Logs de Atividade</h1>
        <p className="text-muted-foreground">
          Auditoria das ultimas 100 acoes registradas por usuarios com acesso ao sistema.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/60 bg-card/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos monitorados</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">Janela atual carregada para auditoria</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ultimas 24 horas</CardTitle>
            <Clock3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{last24Hours}</div>
            <p className="text-xs text-muted-foreground">Movimentacoes recentes na plataforma</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Criacoes vs exclusoes</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{createCount} / {deleteCount}</div>
            <p className="text-xs text-muted-foreground">Criados e removidos dentro do recorte exibido</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recurso mais acionado</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{topResourceLabel}</div>
            <p className="text-xs text-muted-foreground">Tipo com maior volume de eventos</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card/90">
        <CardHeader>
          <CardTitle>Historico detalhado</CardTitle>
          <CardDescription>
            Cada linha representa um evento gravado na tabela <code>activity_logs</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acao</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead className="min-w-[280px]">Detalhes</TableHead>
                  <TableHead>Momento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const userName = log.user?.full_name || 'Usuario removido'
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-normal">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={log.user?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getInitials(userName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground">{userName}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.user?.role || 'sem perfil'}
                              {log.user?.department ? ` | ${log.user.department}` : ''}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionVariant(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            {getResourceLabel(log.resource_type)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.resource_id || 'Sem recurso vinculado'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[360px] whitespace-normal">
                        <p className="text-sm text-muted-foreground break-words">
                          {getDetailsSummary(log.details)}
                        </p>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            {format(new Date(log.created_at), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 text-sm text-muted-foreground">
              Nenhum log de atividade foi encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
