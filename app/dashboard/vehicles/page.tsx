import { createClient } from '@/lib/supabase/server'
import { VehiclesTable } from '@/components/vehicles/vehicles-table'
import { VehiclesHeader } from '@/components/vehicles/vehicles-header'
import type { Vehicle } from '@/lib/types/database'

export const metadata = {
  title: 'Veiculos',
}

async function getVehicles() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('vehicles')
    .select(`
      *,
      assigned_to_profile:profiles!vehicles_assigned_to_fkey(id, full_name, avatar_url),
      created_by_profile:profiles!vehicles_created_by_fkey(id, full_name, avatar_url)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching vehicles:', error)
    return []
  }

  return data as Vehicle[]
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

  return profile
}

export default async function VehiclesPage() {
  const [vehicles, profile] = await Promise.all([
    getVehicles(),
    getUserProfile(),
  ])

  const canManage = profile?.role === 'manager' || profile?.role === 'admin'
  const canDelete = profile?.role === 'admin'

  return (
    <div className="space-y-6">
      <VehiclesHeader canManage={canManage} />
      <VehiclesTable 
        vehicles={vehicles} 
        canManage={canManage}
        canDelete={canDelete}
      />
    </div>
  )
}
