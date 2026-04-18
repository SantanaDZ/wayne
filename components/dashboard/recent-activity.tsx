import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'

interface Activity {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string | null
  details: Record<string, unknown> | null
  created_at: string
  user?: {
    full_name: string
    avatar_url: string | null
  }
}

interface RecentActivityProps {
  activities: Activity[]
}

const actionIcons: Record<string, typeof Plus> = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  view: Eye,
}

const actionLabels: Record<string, string> = {
  create: 'criou',
  update: 'atualizou',
  delete: 'excluiu',
  view: 'visualizou',
}

const resourceLabels: Record<string, string> = {
  equipment: 'equipamento',
  vehicle: 'veiculo',
  security_device: 'dispositivo de seguranca',
  profile: 'perfil',
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getActionIcon = (action: string) => {
    const Icon = actionIcons[action] || Eye
    return <Icon className="h-3 w-3" />
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-chart-4/20 text-chart-4'
      case 'update':
        return 'bg-chart-1/20 text-chart-1'
      case 'delete':
        return 'bg-chart-3/20 text-chart-3'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Atividade Recente</CardTitle>
        <CardDescription>
          Ultimas acoes realizadas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(activity.user?.full_name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">
                        {activity.user?.full_name || 'Usuario'}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getActionColor(activity.action)}`}>
                        {getActionIcon(activity.action)}
                        {actionLabels[activity.action] || activity.action}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {resourceLabels[activity.resource_type] || activity.resource_type}
                      </span>
                    </div>
                    {activity.details && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {JSON.stringify(activity.details)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            Nenhuma atividade registrada ainda
          </div>
        )}
      </CardContent>
    </Card>
  )
}
