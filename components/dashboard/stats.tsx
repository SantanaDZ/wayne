import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wrench, Car, Shield, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react'
import type { ResourceStatus, DeviceStatus } from '@/lib/types/database'

interface DashboardStatsProps {
  totalEquipment: number
  totalVehicles: number
  totalSecurityDevices: number
  equipmentByStatus: Record<ResourceStatus, number>
  vehiclesByStatus: Record<ResourceStatus, number>
  devicesByStatus: Record<DeviceStatus, number>
}

export function DashboardStats({
  totalEquipment,
  totalVehicles,
  totalSecurityDevices,
  equipmentByStatus,
  vehiclesByStatus,
  devicesByStatus,
}: DashboardStatsProps) {
  const stats = [
    {
      title: 'Total de Equipamentos',
      value: totalEquipment,
      icon: Wrench,
      description: `${equipmentByStatus.available} disponiveis`,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total de Veiculos',
      value: totalVehicles,
      icon: Car,
      description: `${vehiclesByStatus.available} disponiveis`,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      title: 'Dispositivos de Seguranca',
      value: totalSecurityDevices,
      icon: Shield,
      description: `${devicesByStatus.active} ativos`,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
  ]

  const statusStats = [
    {
      title: 'Disponiveis',
      value: equipmentByStatus.available + vehiclesByStatus.available,
      icon: CheckCircle,
      color: 'text-chart-4',
    },
    {
      title: 'Em Uso',
      value: equipmentByStatus.in_use + vehiclesByStatus.in_use,
      icon: Clock,
      color: 'text-chart-1',
    },
    {
      title: 'Em Manutencao',
      value: equipmentByStatus.maintenance + vehiclesByStatus.maintenance + devicesByStatus.maintenance,
      icon: AlertTriangle,
      color: 'text-chart-3',
    },
    {
      title: 'Inativos/Aposentados',
      value: equipmentByStatus.retired + vehiclesByStatus.retired + devicesByStatus.inactive,
      icon: XCircle,
      color: 'text-muted-foreground',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusStats.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-sm text-muted-foreground">{stat.title}</span>
              </div>
              <div className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
