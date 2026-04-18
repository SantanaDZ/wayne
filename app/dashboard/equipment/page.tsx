import { createClient } from '@/lib/supabase/server'
import { EquipmentTable } from '@/components/equipment/equipment-table'
import { EquipmentHeader } from '@/components/equipment/equipment-header'
import type { Equipment } from '@/lib/types/database'

export const metadata = {
  title: 'Equipamentos',
}

async function getEquipment() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('equipment')
    .select(`
      *,
      assigned_to_profile:profiles!equipment_assigned_to_fkey(id, full_name, avatar_url),
      created_by_profile:profiles!equipment_created_by_fkey(id, full_name, avatar_url)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching equipment:', error)
    return []
  }

  return data as Equipment[]
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

export default async function EquipmentPage() {
  const [equipment, profile] = await Promise.all([
    getEquipment(),
    getUserProfile(),
  ])

  const canManage = profile?.role === 'manager' || profile?.role === 'admin'
  const canDelete = profile?.role === 'admin'

  return (
    <div className="space-y-6">
      <EquipmentHeader canManage={canManage} />
      <EquipmentTable 
        equipment={equipment} 
        canManage={canManage}
        canDelete={canDelete}
      />
    </div>
  )
}
