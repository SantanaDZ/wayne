import { createClient } from '@/lib/supabase/server'
import { DashboardStats } from '@/components/dashboard/stats'
import { DashboardCharts } from '@/components/dashboard/charts'
import { RecentActivity } from '@/components/dashboard/recent-activity'

export const metadata = {
  title: 'Dashboard',
}

async function getDashboardData() {
  const supabase = await createClient()

  // Fetch equipment counts
  const { data: equipment } = await supabase
    .from('equipment')
    .select('status')

  // Fetch vehicles counts
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('status')

  // Fetch security devices counts
  const { data: securityDevices } = await supabase
    .from('security_devices')
    .select('status')

  // Fetch recent activity
  const { data: recentActivity } = await supabase
    .from('activity_logs')
    .select(`
      *,
      user:profiles(full_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  // Calculate stats
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

  return {
    totalEquipment: equipment?.length || 0,
    totalVehicles: vehicles?.length || 0,
    totalSecurityDevices: securityDevices?.length || 0,
    equipmentByStatus,
    vehiclesByStatus,
    devicesByStatus,
    recentActivity: recentActivity || [],
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
