'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type SecurityLevel = 'low' | 'medium' | 'high' | 'maximum'

export interface RouteSecurity {
  id: string
  route: string
  label: string
  security_level: SecurityLevel | null
  updated_at: string
}

export async function getRouteSecurityAction(): Promise<RouteSecurity[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('route_security').select('*')
  return (data as RouteSecurity[]) ?? []
}

export async function setRouteSecurityAction(
  route: string,
  label: string,
  securityLevel: SecurityLevel | null,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Apenas administradores.' }

  if (securityLevel === null) {
    await supabase.from('route_security').delete().eq('route', route)
  } else {
    await supabase.from('route_security').upsert(
      { route, label, security_level: securityLevel, updated_by: user.id, updated_at: new Date().toISOString() },
      { onConflict: 'route' }
    )
  }

  revalidatePath('/dashboard/access-control')
  return { success: true }
}
