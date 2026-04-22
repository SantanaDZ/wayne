'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Wrench, Car, Shield, CheckCircle, Clock, AlertTriangle, XCircle,
  ChevronLeft, ChevronRight, ImageOff,
} from 'lucide-react'
import type { ResourceStatus, DeviceStatus } from '@/lib/types/database'
import { ItemsDrawer, type DrawerItem } from './items-drawer'

interface DashboardStatsProps {
  totalEquipment: number
  totalVehicles: number
  totalSecurityDevices: number
  equipmentByStatus: Record<ResourceStatus, number>
  vehiclesByStatus: Record<ResourceStatus, number>
  devicesByStatus: Record<DeviceStatus, number>
  allItems: DrawerItem[]
}

const statusLabel: Record<string, string> = {
  available: 'Disponível', in_use: 'Em Uso', maintenance: 'Em Manutenção',
  retired: 'Aposentado', active: 'Ativo', inactive: 'Inativo',
}
const statusColor: Record<string, string> = {
  available:   'bg-chart-4/20 text-chart-4 border-chart-4/30',
  in_use:      'bg-chart-1/20 text-chart-1 border-chart-1/30',
  maintenance: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  retired:     'bg-muted/60 text-muted-foreground border-border',
  active:      'bg-chart-4/20 text-chart-4 border-chart-4/30',
  inactive:    'bg-muted/60 text-muted-foreground border-border',
}

// ── Card grande (linha de cima) ─────────────────────────────────────────────

interface MainStatCardProps {
  title: string
  value: number
  description: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  items: DrawerItem[]
  onOpenAll: () => void
}

function MainStatCard({ title, value, description, icon: Icon, iconColor, iconBg, items, onOpenAll }: MainStatCardProps) {
  const [idx, setIdx] = useState(0)
  const item = items[idx] ?? null
  const total = items.length
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx((i) => (i - 1 + total) % total) }
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx((i) => (i + 1) % total) }

  const startLoop = () => {
    if (total <= 1) return
    intervalRef.current = setInterval(() => setIdx((i) => (i + 1) % total), 1800)
  }
  const stopLoop = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  return (
    <Card className="border-border/50 overflow-hidden flex flex-col">
      {/* Imagem */}
      <div
        className="relative w-full aspect-video bg-muted/30 cursor-pointer group"
        onClick={onOpenAll}
        onMouseEnter={startLoop}
        onMouseLeave={stopLoop}
      >
        {item?.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover scale-[1.18] transition-transform duration-500 group-hover:scale-[1.18]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground/30">
            <ImageOff className="h-8 w-8" />
            <span className="text-xs">Sem imagem</span>
          </div>
        )}

        {/* overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* nome + status sobre a imagem */}
        {item && (
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2">
            <p className="text-white text-sm font-medium truncate leading-tight">{item.name}</p>
            {item.description && (
              <p className="text-white/60 text-xs truncate">{item.description}</p>
            )}
            <Badge variant="outline" className={`mt-1 text-[10px] h-4 px-1.5 border ${statusColor[item.status] ?? ''}`}>
              {statusLabel[item.status] ?? item.status}
            </Badge>
          </div>
        )}

        {/* navegação */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              onMouseEnter={stopLoop}
              onMouseLeave={startLoop}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={next}
              onMouseEnter={stopLoop}
              onMouseLeave={startLoop}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="absolute top-2 right-2 text-[10px] text-white/70 bg-black/40 rounded-full px-1.5 py-0.5">
              {idx + 1}/{total}
            </span>
          </>
        )}
      </div>

      {/* Info */}
      <CardContent className="pt-3 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className={`p-2 rounded-md ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Card pequeno (linha de baixo) ───────────────────────────────────────────

interface StatusCardProps {
  title: string
  value: number
  icon: React.ElementType
  color: string
  items: DrawerItem[]
  onOpenAll: () => void
}

function StatusCard({ title, value, icon: Icon, color, items, onOpenAll }: StatusCardProps) {
  const [idx, setIdx] = useState(0)
  const item = items[idx] ?? null
  const total = items.length
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx((i) => (i - 1 + total) % total) }
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx((i) => (i + 1) % total) }

  const startLoop = () => {
    if (total <= 1) return
    intervalRef.current = setInterval(() => setIdx((i) => (i + 1) % total), 1800)
  }
  const stopLoop = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  return (
    <Card className="border-border/50 overflow-hidden flex flex-col">
      {/* Imagem */}
      <div
        className="relative w-full aspect-square bg-muted/30 cursor-pointer group"
        onClick={onOpenAll}
        onMouseEnter={startLoop}
        onMouseLeave={stopLoop}
      >
        {item?.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover scale-[1.18] transition-transform duration-500 group-hover:scale-[1.25]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
            <ImageOff className="h-6 w-6" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {item && (
          <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium truncate">
            {item.name}
          </p>
        )}

        {total > 1 && (
          <>
            <button type="button" onClick={prev} onMouseEnter={stopLoop} onMouseLeave={startLoop} className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors">
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button type="button" onClick={next} onMouseEnter={stopLoop} onMouseLeave={startLoop} className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors">
              <ChevronRight className="h-3 w-3" />
            </button>
            <span className="absolute top-1.5 right-1.5 text-[9px] text-white/70 bg-black/40 rounded-full px-1 py-0.5">
              {idx + 1}/{total}
            </span>
          </>
        )}
      </div>

      {/* Info */}
      <CardContent className="pt-2 pb-2 px-3">
        <div className="flex items-center gap-1.5">
          <Icon className={`h-3.5 w-3.5 ${color}`} />
          <span className="text-xs text-muted-foreground">{title}</span>
        </div>
        <div className={`text-xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  )
}

// ── Componente principal ────────────────────────────────────────────────────

export function DashboardStats({
  totalEquipment, totalVehicles, totalSecurityDevices,
  equipmentByStatus, vehiclesByStatus, devicesByStatus, allItems,
}: DashboardStatsProps) {
  const [drawer, setDrawer] = useState<{ title: string; items: DrawerItem[] } | null>(null)

  const equipment = allItems.filter((i) => i.type === 'equipment')
  const vehicles  = allItems.filter((i) => i.type === 'vehicle')
  const devices   = allItems.filter((i) => i.type === 'security_device')

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MainStatCard
            title="Total de Equipamentos" value={totalEquipment}
            description={`${equipmentByStatus.available} disponiveis`}
            icon={Wrench} iconColor="text-primary" iconBg="bg-primary/10"
            items={equipment}
            onOpenAll={() => setDrawer({ title: 'Equipamentos', items: equipment })}
          />
          <MainStatCard
            title="Total de Veiculos" value={totalVehicles}
            description={`${vehiclesByStatus.available} disponiveis`}
            icon={Car} iconColor="text-chart-2" iconBg="bg-chart-2/10"
            items={vehicles}
            onOpenAll={() => setDrawer({ title: 'Veículos', items: vehicles })}
          />
          <MainStatCard
            title="Dispositivos de Seguranca" value={totalSecurityDevices}
            description={`${devicesByStatus.active} ativos`}
            icon={Shield} iconColor="text-chart-4" iconBg="bg-chart-4/10"
            items={devices}
            onOpenAll={() => setDrawer({ title: 'Dispositivos de Segurança', items: devices })}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusCard
            title="Disponiveis" value={equipmentByStatus.available + vehiclesByStatus.available}
            icon={CheckCircle} color="text-chart-4"
            items={allItems.filter((i) => i.status === 'available')}
            onOpenAll={() => setDrawer({ title: 'Disponíveis', items: allItems.filter((i) => i.status === 'available') })}
          />
          <StatusCard
            title="Em Uso" value={equipmentByStatus.in_use + vehiclesByStatus.in_use}
            icon={Clock} color="text-chart-1"
            items={allItems.filter((i) => i.status === 'in_use')}
            onOpenAll={() => setDrawer({ title: 'Em Uso', items: allItems.filter((i) => i.status === 'in_use') })}
          />
          <StatusCard
            title="Em Manutencao" value={equipmentByStatus.maintenance + vehiclesByStatus.maintenance + devicesByStatus.maintenance}
            icon={AlertTriangle} color="text-chart-3"
            items={allItems.filter((i) => i.status === 'maintenance')}
            onOpenAll={() => setDrawer({ title: 'Em Manutenção', items: allItems.filter((i) => i.status === 'maintenance') })}
          />
          <StatusCard
            title="Inativos/Aposentados" value={equipmentByStatus.retired + vehiclesByStatus.retired + devicesByStatus.inactive}
            icon={XCircle} color="text-muted-foreground"
            items={allItems.filter((i) => i.status === 'retired' || i.status === 'inactive')}
            onOpenAll={() => setDrawer({ title: 'Inativos / Aposentados', items: allItems.filter((i) => i.status === 'retired' || i.status === 'inactive') })}
          />
        </div>
      </div>

      <ItemsDrawer
        open={!!drawer}
        onOpenChange={(o) => { if (!o) setDrawer(null) }}
        title={drawer?.title ?? ''}
        items={drawer?.items ?? []}
      />
    </>
  )
}
