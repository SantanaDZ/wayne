import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EquipmentForm } from '@/components/equipment/equipment-form'

export const metadata = {
  title: 'Novo Equipamento',
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
    redirect('/dashboard/equipment')
  }

  return user.id
}

export default async function NewEquipmentPage() {
  const [userId, profiles] = await Promise.all([
    checkPermission(),
    getProfiles(),
  ])

  return <EquipmentForm profiles={profiles} userId={userId} />
}
