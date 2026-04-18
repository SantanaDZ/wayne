import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VehicleDetails } from '@/components/vehicles/vehicle-details'
import type { Vehicle } from '@/lib/types/database'

export const metadata = {
  title: 'Detalhes do Veículo | Wayne Industries',
}

async function getVehicle(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vehicles')
    .select(`
      *,
      assigned_to_profile:profiles!vehicles_assigned_to_fkey(id, full_name, avatar_url, role, department),
      created_by_profile:profiles!vehicles_created_by_fkey(id, full_name, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data as Vehicle
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

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [vehicle, profile] = await Promise.all([
    getVehicle(id),
    getUserProfile(),
  ])

  if (!vehicle) {
    notFound()
  }

  const canManage = profile?.role === 'manager' || profile?.role === 'admin'
  const canDelete = profile?.role === 'admin'

  return (
    <VehicleDetails
      vehicle={vehicle}
      canManage={canManage}
      canDelete={canDelete}
    />
  )
}
