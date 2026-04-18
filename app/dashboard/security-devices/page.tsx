import { createClient } from '@/lib/supabase/server'
import { SecurityDevicesTable } from '@/components/security-devices/security-devices-table'
import { SecurityDevicesHeader } from '@/components/security-devices/security-devices-header'
import type { SecurityDevice } from '@/lib/types/database'

export const metadata = {
  title: 'Dispositivos de Seguranca',
}

async function getSecurityDevices() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('security_devices')
    .select(`
      *,
      created_by_profile:profiles!security_devices_created_by_fkey(id, full_name, avatar_url)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching security devices:', error)
    return []
  }

  return data as SecurityDevice[]
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

export default async function SecurityDevicesPage() {
  const [devices, profile] = await Promise.all([
    getSecurityDevices(),
    getUserProfile(),
  ])

  const canManage = profile?.role === 'manager' || profile?.role === 'admin'
  const canDelete = profile?.role === 'admin'

  return (
    <div className="space-y-6">
      <SecurityDevicesHeader canManage={canManage} />
      <SecurityDevicesTable 
        devices={devices} 
        canManage={canManage}
        canDelete={canDelete}
      />
    </div>
  )
}
