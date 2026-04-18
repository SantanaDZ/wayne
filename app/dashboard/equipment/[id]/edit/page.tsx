import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EquipmentForm } from '@/components/equipment/equipment-form'
import type { Equipment } from '@/lib/types/database'

export const metadata = {
  title: 'Editar Equipamento',
}

async function getEquipment(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data as Equipment
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

export default async function EditEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [userId, equipment, profiles] = await Promise.all([
    checkPermission(),
    getEquipment(id),
    getProfiles(),
  ])

  if (!equipment) {
    notFound()
  }

  return <EquipmentForm equipment={equipment} profiles={profiles} userId={userId} />
}
