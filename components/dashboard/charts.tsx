'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import type { ResourceStatus, DeviceStatus } from '@/lib/types/database'

interface DashboardChartsProps {
  equipmentByStatus: Record<ResourceStatus, number>
  vehiclesByStatus: Record<ResourceStatus, number>
  devicesByStatus: Record<DeviceStatus, number>
}

const COLORS = {
  available: 'var(--chart-4)',
  in_use: 'var(--chart-1)',
  maintenance: 'var(--chart-3)',
  retired: 'var(--muted-foreground)',
  active: 'var(--chart-4)',
  inactive: 'var(--muted-foreground)',
}

const STATUS_LABELS: Record<string, string> = {
  available: 'Disponivel',
  in_use: 'Em Uso',
  maintenance: 'Manutencao',
  retired: 'Aposentado',
  active: 'Ativo',
  inactive: 'Inativo',
}

export function DashboardCharts({
  equipmentByStatus,
  vehiclesByStatus,
  devicesByStatus,
}: DashboardChartsProps) {
  // Prepare data for pie chart (all resources combined by status)
  const resourceStatusData = [
    { name: 'Disponivel', value: equipmentByStatus.available + vehiclesByStatus.available, fill: COLORS.available },
    { name: 'Em Uso', value: equipmentByStatus.in_use + vehiclesByStatus.in_use, fill: COLORS.in_use },
    { name: 'Manutencao', value: equipmentByStatus.maintenance + vehiclesByStatus.maintenance, fill: COLORS.maintenance },
    { name: 'Aposentado', value: equipmentByStatus.retired + vehiclesByStatus.retired, fill: COLORS.retired },
  ].filter(item => item.value > 0)

  // Prepare data for bar chart (comparison by resource type)
  const comparisonData = [
    {
      name: 'Equipamentos',
      disponivel: equipmentByStatus.available,
      emUso: equipmentByStatus.in_use,
      manutencao: equipmentByStatus.maintenance,
    },
    {
      name: 'Veiculos',
      disponivel: vehiclesByStatus.available,
      emUso: vehiclesByStatus.in_use,
      manutencao: vehiclesByStatus.maintenance,
    },
    {
      name: 'Seguranca',
      disponivel: devicesByStatus.active,
      emUso: 0,
      manutencao: devicesByStatus.maintenance,
    },
  ]

  const hasData = resourceStatusData.some(item => item.value > 0)

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Visao Geral de Recursos</CardTitle>
        <CardDescription>
          Distribuicao de status dos recursos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="space-y-6">
            {/* Pie Chart */}
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resourceStatusData}
                    cx="50%"
                    cy="55%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {resourceStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#3a3f4a',
                      border: '1px solid #555b66',
                      borderRadius: '8px',
                    }}
                    itemStyle={{ color: '#ffffff' }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#ffffff', fontSize: 14, fontWeight: 600 }}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#3a3f4a',
                      border: '1px solid #555b66',
                      borderRadius: '8px',
                      color: '#ffffff',
                    }}
                  />
                  <Bar dataKey="disponivel" name="Disponivel" fill={COLORS.available} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="emUso" name="Em Uso" fill={COLORS.in_use} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="manutencao" name="Manutencao" fill={COLORS.maintenance} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            Nenhum recurso cadastrado ainda
          </div>
        )}
      </CardContent>
    </Card>
  )
}
