import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VehicleForm } from '@/components/vehicles/vehicle-form'

export const metadata = {
  title: 'Novo Veículo | Wayne Industries',
}

async function getProfiles() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name')
  return data || []
}

async function checkPermission() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
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

export default async function NewVehiclePage() {
  const [userId, profiles] = await Promise.all([
    checkPermission(),
    getProfiles(),
  ])

  return <VehicleForm profiles={profiles} userId={userId} />
}
