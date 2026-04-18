import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EquipmentDetails } from '@/components/equipment/equipment-details'
import type { Equipment } from '@/lib/types/database'

export const metadata = {
  title: 'Detalhes do Equipamento',
}

async function getEquipment(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('equipment')
    .select(`
      *,
      assigned_to_profile:profiles!equipment_assigned_to_fkey(id, full_name, avatar_url, role, department),
      created_by_profile:profiles!equipment_created_by_fkey(id, full_name, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data as Equipment
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

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [equipment, profile] = await Promise.all([
    getEquipment(id),
    getUserProfile(),
  ])

  if (!equipment) {
    notFound()
  }

  const canManage = profile?.role === 'manager' || profile?.role === 'admin'
  const canDelete = profile?.role === 'admin'

  return (
    <EquipmentDetails
      equipment={equipment}
      canManage={canManage}
      canDelete={canDelete}
    />
  )
}
