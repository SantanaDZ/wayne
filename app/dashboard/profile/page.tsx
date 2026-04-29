import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WeatherWidget } from '@/components/profile/weather-widget'
import { MiniCalendar } from '@/components/profile/mini-calendar'
import {
  LayoutDashboard, Wrench, Car, Shield,
  MapPin, Users, Activity, Plus, Pencil, Trash2,
  ArrowRight,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Profile } from '@/lib/types/database'

export const metadata = { title: 'Meu Perfil' }

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

const roleLabel: Record<string, string> = {
  admin: 'Administrador', manager: 'Gerente', employee: 'Funcionário',
}

const actionLabel: Record<string, string> = {
  create: 'criou', update: 'atualizou', delete: 'excluiu',
}
const resourceLabel: Record<string, string> = {
  equipment: 'equipamento', vehicle: 'veículo',
  security_device: 'dispositivo', profile: 'perfil',
}
const actionColor: Record<string, string> = {
  create: 'bg-chart-4/20 text-chart-4',
  update: 'bg-chart-1/20 text-chart-1',
  delete: 'bg-destructive/20 text-destructive',
}
const ActionIcon: Record<string, React.ElementType> = {
  create: Plus, update: Pencil, delete: Trash2,
}

const quickLinks = [
  { label: 'Dashboard',            href: '/dashboard',               icon: LayoutDashboard },
  { label: 'Equipamentos',         href: '/dashboard/equipment',     icon: Wrench          },
  { label: 'Veículos',             href: '/dashboard/vehicles',      icon: Car             },
  { label: 'Dispositivos',         href: '/dashboard/security-devices', icon: Shield       },
  { label: 'Locais',               href: '/dashboard/locations',     icon: MapPin          },
  { label: 'Usuários',             href: '/dashboard/users',         icon: Users           },
  { label: 'Logs de Atividade',    href: '/dashboard/activity-logs', icon: Activity        },
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: activities }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const p = profile as Profile | null

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Saudação ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/30">
            <AvatarImage src={p?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
              {getInitials(p?.full_name || user.email || 'U')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-muted-foreground text-sm">{greeting()},</p>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {p?.full_name || user.email}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {roleLabel[p?.role ?? 'employee']}
              </Badge>
              {p?.department && (
                <span className="text-xs text-muted-foreground">{p.department}</span>
              )}
            </div>
          </div>
        </div>

        <Button asChild size="lg" className="gap-2 shrink-0">
          <Link href="/dashboard">
            <LayoutDashboard className="h-4 w-4" />
            Ir para a Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* ── Clima + Calendário ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <WeatherWidget />
        <MiniCalendar />
      </div>

      {/* ── Últimas ações + Acesso rápido ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Últimas ações */}
        <Card className="border-border/50 bg-card/80">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono mb-4">
              Minhas últimas ações
            </p>
            {!activities || activities.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma ação registrada ainda.</p>
            ) : (
              <div className="space-y-3">
                {activities.map(a => {
                  const Icon = ActionIcon[a.action] ?? Plus
                  const name = (a.details as Record<string, unknown>)?.name as string | undefined
                  return (
                    <div key={a.id} className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1.5 rounded-md ${actionColor[a.action] ?? 'bg-muted text-muted-foreground'}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground leading-snug">
                          <span className="capitalize">{actionLabel[a.action] ?? a.action}</span>
                          {' '}
                          <span className="text-muted-foreground">{resourceLabel[a.resource_type] ?? a.resource_type}</span>
                          {name && <span className="font-medium"> "{name}"</span>}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">
                          {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acesso rápido */}
        <Card className="border-border/50 bg-card/80">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono mb-4">
              Acesso rápido
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 p-3 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/50 hover:border-border transition-colors text-sm text-foreground group"
                >
                  <Icon className="h-4 w-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">{label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
