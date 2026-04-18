'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Pencil, Search, Trash2 } from 'lucide-react'

import { ResourceDisplay } from '@/components/resources/resource-display'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { DeviceStatus, SecurityDevice } from '@/lib/types/database'
import { DeleteDeviceDialog } from './delete-device-dialog'

interface SecurityDevicesTableProps {
  devices: SecurityDevice[]
  canManage: boolean
  canDelete: boolean
}

const statusLabels: Record<DeviceStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  maintenance: 'Manutencao',
}

const statusColors: Record<DeviceStatus, string> = {
  active: 'bg-wayne-success/20 text-wayne-success border-wayne-success/30',
  inactive: 'bg-muted text-muted-foreground border-muted-foreground/30',
  maintenance: 'bg-wayne-warning/20 text-wayne-warning border-wayne-warning/30',
}

const typeLabels: Record<string, string> = {
  camera: 'Camera',
  sensor: 'Sensor',
  biometric: 'Biometria',
  alarm: 'Alarme',
  other: 'Outros',
}

export function SecurityDevicesTable({ devices, canManage, canDelete }: SecurityDevicesTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredDevices = devices.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.serial_number?.toLowerCase().includes(search.toLowerCase()) ||
      item.location?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const emptyMessage =
    search || statusFilter !== 'all'
      ? 'Nenhum dispositivo encontrado com os filtros aplicados.'
      : 'Nenhum dispositivo cadastrado ainda.'

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, numero de serie ou localizacao..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
            <SelectItem value="maintenance">Manutencao</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ResourceDisplay
        items={filteredDevices}
        getItemKey={(item) => item.id}
        getItemTitle={(item) => item.name}
        getItemEyebrow={(item) => typeLabels[item.type] || item.type}
        getItemSummary={(item) =>
          [item.ip_address ? `IP ${item.ip_address}` : null, item.location]
            .filter(Boolean)
            .join(' • ')
        }
        renderHero={(item) => (
          <article className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(12,16,23,0.92),rgba(7,10,15,0.98))] p-6 sm:p-8">
              <div className="flex h-full flex-col justify-between gap-6">
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary/70">
                        {typeLabels[item.type] || item.type}
                      </p>
                      <h3 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
                        {item.name}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.description || 'Visao ampliada do dispositivo com foco em status, rede e manutencao.'}
                      </p>
                    </div>
                    <Badge variant="outline" className={statusColors[item.status]}>
                      {statusLabels[item.status]}
                    </Badge>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                      <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                        Endereco IP
                      </span>
                      <p className="mt-2 font-mono text-xl text-foreground">
                        {item.ip_address || 'Nao configurado'}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                      <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                        Serie
                      </span>
                      <p className="mt-2 font-mono text-xl text-foreground">
                        {item.serial_number || 'Nao informada'}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:col-span-2">
                      <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                        Localizacao
                      </span>
                      <p className="mt-2 text-xl text-foreground">
                        {item.location || 'Nao definida'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href={`/dashboard/security-devices/${item.id}`}>
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </Link>
                  </Button>
                  {canManage ? (
                    <Button variant="outline" asChild>
                      <Link href={`/dashboard/security-devices/${item.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Link>
                    </Button>
                  ) : null}
                  {canDelete ? (
                    <Button variant="destructive" onClick={() => setDeleteId(item.id)}>
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-wayne-warning/20 bg-[radial-gradient(circle_at_top,rgba(255,209,102,0.22),transparent_42%),linear-gradient(180deg,rgba(17,24,32,0.94),rgba(8,12,18,0.96))] p-6">
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-wayne-warning/10 to-transparent" />
                <div className="relative flex min-h-[260px] items-center justify-center">
                  <Avatar className="h-48 w-48 rounded-[2rem] border border-white/10 bg-black/20 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                    <AvatarImage src={item.image_url || undefined} alt={item.name} className="object-cover" />
                    <AvatarFallback className="rounded-[2rem] bg-white/[0.04] text-4xl text-muted-foreground">
                      {item.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(12,16,22,0.94),rgba(9,12,17,0.98))] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-wayne-warning/80">
                  Status da Rede
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  {item.status === 'active'
                    ? 'Dispositivo operando dentro da malha de seguranca.'
                    : item.status === 'maintenance'
                      ? 'Item em manutencao, exige acompanhamento.'
                      : 'Dispositivo atualmente desativado.'}
                </p>
              </div>
            </div>
          </article>
        )}
        renderTable={
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome e IP</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Localizacao</TableHead>
                  <TableHead className="w-[190px]">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-md border border-border/50">
                          <AvatarImage src={item.image_url || undefined} alt={item.name} className="object-cover" />
                          <AvatarFallback className="rounded-md bg-muted text-muted-foreground">
                            {item.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{item.name}</div>
                          {item.ip_address ? (
                            <div className="font-mono text-xs text-muted-foreground">
                              IP: {item.ip_address}
                            </div>
                          ) : item.serial_number ? (
                            <div className="text-xs text-muted-foreground">
                              SN: {item.serial_number}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {typeLabels[item.type] || item.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[item.status]}>
                        {statusLabels[item.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="break-all text-sm text-muted-foreground">
                        {item.location || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/security-devices/${item.id}`}>
                            <Eye className="h-4 w-4" />
                            Ver
                          </Link>
                        </Button>
                        {canManage ? (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/security-devices/${item.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                              Editar
                            </Link>
                          </Button>
                        ) : null}
                        {canDelete ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        }
        emptyState={
          <div className="rounded-3xl border border-dashed border-white/10 bg-card/50 p-10 text-center text-muted-foreground">
            {emptyMessage}
          </div>
        }
      />

      <DeleteDeviceDialog
        deviceId={deleteId}
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      />
    </div>
  )
}
