import { createClient } from '@/lib/supabase/server'
import { RouteSecurityManager } from '@/components/access-control/route-security-manager'
import { ShieldAlert } from 'lucide-react'
import type { Profile } from '@/lib/types/database'
import type { RouteSecurity } from './route-actions'

export const metadata = { title: 'Controle de Acesso' }

export default async function AccessControlPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [profileRes, routeSecRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('route_security').select('*'),
  ])

  const profile  = profileRes.data as Profile | null
  const routeSec = (routeSecRes.data as RouteSecurity[]) ?? []
  const isAdmin  = profile?.role === 'admin'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldAlert className="h-7 w-7 text-primary" />
          Controle de Acesso
        </h1>
        <p className="text-muted-foreground mt-1">
          Defina o nível de segurança exigido para cada seção do sistema.
        </p>
      </div>

      {isAdmin
        ? <RouteSecurityManager initialConfig={routeSec} />
        : (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm font-mono">
            Apenas administradores podem gerenciar o controle de acesso.
          </div>
        )
      }
    </div>
  )
}
