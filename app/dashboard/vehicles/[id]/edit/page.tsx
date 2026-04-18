import { notFound, redirect } from 'next/navigation'

import { VehicleForm } from '@/components/vehicles/vehicle-form'
import { createClient } from '@/lib/supabase/server'
import type { Profile, Vehicle } from '@/lib/types/database'

export const metadata = {
  title: 'Editar Veiculo',
}

async function getVehicle(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data as Vehicle
}

async function getProfiles() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name')

  return (data || []) as Profile[]
}

async function checkPermission() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager' && profile?.role !== 'admin') {
    redirect('/dashboard/vehicles')
  }

  return user.id
}

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [userId, vehicle, profiles] = await Promise.all([
    checkPermission(),
    getVehicle(id),
    getProfiles(),
  ])

  if (!vehicle) {
    notFound()
  }

  return <VehicleForm vehicle={vehicle} profiles={profiles} userId={userId} />
}
