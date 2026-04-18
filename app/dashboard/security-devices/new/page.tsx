import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SecurityDeviceForm } from '@/components/security-devices/security-device-form'

export const metadata = {
  title: 'Novo Dispositivo | Wayne Industries',
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
    redirect('/dashboard/security-devices')
  }

  return user.id
}

export default async function NewSecurityDevicePage() {
  const userId = await checkPermission()
  return <SecurityDeviceForm userId={userId} />
}
