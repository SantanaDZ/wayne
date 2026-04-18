import { createClient } from '@/lib/supabase/server'
import { AreasTable } from '@/components/access-control/areas-table'
import { AccessControlHeader } from '@/components/access-control/access-control-header'
import type { RestrictedArea, Profile } from '@/lib/types/database'

export const metadata = {
  title: 'Controle de Acesso',
}

async function getRestrictedAreas() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('restricted_areas')
    .select('*')
    .order('security_level', { ascending: false })

  if (error) {
    console.error('Error fetching restricted areas:', error)
    return []
  }

  return data as RestrictedArea[]
}

async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile as Profile
}

export default async function AccessControlPage() {
  const [areas, profile] = await Promise.all([
    getRestrictedAreas(),
    getUserProfile(),
  ])

  const canManage = profile?.role === 'manager' || profile?.role === 'admin'

  return (
    <div className="space-y-6">
      <AccessControlHeader canManage={canManage} />
      <AreasTable 
        areas={areas} 
        canManage={canManage}
        profile={profile}
      />
    </div>
  )
}
