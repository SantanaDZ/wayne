import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SecurityDeviceDetails } from '@/components/security-devices/security-device-details'
import type { SecurityDevice } from '@/lib/types/database'

export const metadata = {
  title: 'Detalhes do Dispositivo | Wayne Industries',
}

async function getDevice(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('security_devices')
    .select(`
      *,
      created_by_profile:profiles!security_devices_created_by_fkey(id, full_name, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data as SecurityDevice
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

export default async function SecurityDeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [device, profile] = await Promise.all([
    getDevice(id),
    getUserProfile(),
  ])

  if (!device) {
    notFound()
  }

  const canManage = profile?.role === 'manager' || profile?.role === 'admin'
  const canDelete = profile?.role === 'admin'

  return (
    <SecurityDeviceDetails
      device={device}
      canManage={canManage}
      canDelete={canDelete}
    />
  )
}
