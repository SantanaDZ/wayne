import { notFound, redirect } from 'next/navigation'

import { SecurityDeviceForm } from '@/components/security-devices/security-device-form'
import { createClient } from '@/lib/supabase/server'
import type { SecurityDevice } from '@/lib/types/database'

export const metadata = {
  title: 'Editar Dispositivo',
}

async function getDevice(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('security_devices')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data as SecurityDevice
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
    redirect('/dashboard/security-devices')
  }

  return user.id
}

export default async function EditSecurityDevicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [userId, device] = await Promise.all([
    checkPermission(),
    getDevice(id),
  ])

  if (!device) {
    notFound()
  }

  return <SecurityDeviceForm device={device} userId={userId} />
}
