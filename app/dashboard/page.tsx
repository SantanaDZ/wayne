import { createClient } from '@/lib/supabase/server'
import { DashboardStats } from '@/components/dashboard/stats'
import { DashboardCharts } from '@/components/dashboard/charts'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import type { DrawerItem } from '@/components/dashboard/items-drawer'

export const metadata = {
  title: 'Dashboard',
}

async function getDashboardData() {
  const supabase = await createClient()

  const [
    { data: equipment },
    { data: vehicles },
    { data: securityDevices },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from('equipment').select('id, name, description, status, image_url'),
    supabase.from('vehicles').select('id, name, description, status, image_url'),
    supabase.from('security_devices').select('id, name, description, status, image_url'),
    supabase
      .from('activity_logs')
      .select('*, user:profiles(full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const equipmentByStatus = {
    available: equipment?.filter(e => e.status === 'available').length || 0,
    in_use: equipment?.filter(e => e.status === 'in_use').length || 0,
    maintenance: equipment?.filter(e => e.status === 'maintenance').length || 0,
    retired: equipment?.filter(e => e.status === 'retired').length || 0,
  }

  const vehiclesByStatus = {
    available: vehicles?.filter(v => v.status === 'available').length || 0,
    in_use: vehicles?.filter(v => v.status === 'in_use').length || 0,
    maintenance: vehicles?.filter(v => v.status === 'maintenance').length || 0,
    retired: vehicles?.filter(v => v.status === 'retired').length || 0,
  }

  const devicesByStatus = {
    active: securityDevices?.filter(d => d.status === 'active').length || 0,
    inactive: securityDevices?.filter(d => d.status === 'inactive').length || 0,
    maintenance: securityDevices?.filter(d => d.status === 'maintenance').length || 0,
  }

  const allItems: DrawerItem[] = [
    ...(equipment ?? []).map(e => ({ ...e, type: 'equipment' as const })),
    ...(vehicles ?? []).map(v => ({ ...v, type: 'vehicle' as const })),
    ...(securityDevices ?? []).map(d => ({ ...d, type: 'security_device' as const })),
  ]

  return {
    totalEquipment: equipment?.length || 0,
    totalVehicles: vehicles?.length || 0,
    totalSecurityDevices: securityDevices?.length || 0,
    equipmentByStatus,
    vehiclesByStatus,
    devicesByStatus,
    recentActivity: recentActivity || [],
    allItems,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visao geral dos recursos das Industrias Wayne
        </p>
      </div>

      <DashboardStats
        totalEquipment={data.totalEquipment}
        totalVehicles={data.totalVehicles}
        totalSecurityDevices={data.totalSecurityDevices}
        equipmentByStatus={data.equipmentByStatus}
        vehiclesByStatus={data.vehiclesByStatus}
        devicesByStatus={data.devicesByStatus}
        allItems={data.allItems}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCharts
          equipmentByStatus={data.equipmentByStatus}
          vehiclesByStatus={data.vehiclesByStatus}
          devicesByStatus={data.devicesByStatus}
        />
        <RecentActivity activities={data.recentActivity} />
      </div>
    </div>
  )
}
