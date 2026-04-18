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
import type { ResourceStatus, Vehicle } from '@/lib/types/database'
import { DeleteVehicleDialog } from './delete-vehicle-dialog'

interface VehiclesTableProps {
  vehicles: Vehicle[]
  canManage: boolean
  canDelete: boolean
}

const statusLabels: Record<ResourceStatus, string> = {
  available: 'Disponivel',
  in_use: 'Em Uso',
  maintenance: 'Manutencao',
  retired: 'Aposentado',
}

const statusColors: Record<ResourceStatus, string> = {
  available: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  in_use: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
  maintenance: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  retired: 'bg-muted text-muted-foreground border-muted-foreground/30',
}

const typeLabels: Record<string, string> = {
  car: 'Carro',
  suv: 'SUV',
  truck: 'Caminhao',
  motorcycle: 'Motocicleta',
  helicopter: 'Helicoptero',
  aircraft: 'Aeronave',
  boat: 'Barco',
  other: 'Outro',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((chunk) => chunk[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getVehiclePlate(vehicle: Vehicle) {
  return vehicle.plate_number || '-'
}

export function VehiclesTable({ vehicles, canManage, canDelete }: VehiclesTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredVehicles = vehicles.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.plate_number?.toLowerCase().includes(search.toLowerCase()) ||
      item.model?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const emptyMessage =
    search || statusFilter !== 'all'
      ? 'Nenhum veiculo encontrado com os filtros aplicados.'
      : 'Nenhum veiculo cadastrado ainda.'

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, placa ou modelo..."
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
            <SelectItem value="available">Disponivel</SelectItem>
            <SelectItem value="in_use">Em Uso</SelectItem>
            <SelectItem value="maintenance">Manutencao</SelectItem>
            <SelectItem value="retired">Aposentado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ResourceDisplay
        items={filteredVehicles}
        getItemKey={(item) => item.id}
        getItemTitle={(item) => item.name}
        getItemEyebrow={(item) => typeLabels[item.type] || item.type}
        getItemSummary={(item) =>
          [item.model, item.year ? String(item.year) : null, item.location]
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
                        {item.description || 'Veiculo pronto para destacamento com visual em foco e acesso rapido a acoes.'}
                      </p>
                    </div>
                    <Badge variant="outline" className={statusColors[item.status]}>
                      {statusLabels[item.status]}
                    </Badge>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                      <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                        Placa
                      </span>
                      <p className="mt-2 font-mono text-2xl text-foreground">
                        {getVehiclePlate(item)}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                      <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                        Modelo
                      </span>
                      <p className="mt-2 text-2xl text-foreground">
                        {item.model || 'Nao informado'}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                      <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                        Ano
                      </span>
                      <p className="mt-2 text-2xl text-foreground">
                        {item.year || '-'}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                      <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                        Localizacao
                      </span>
                      <p className="mt-2 text-lg text-foreground">
                        {item.location || 'Nao definida'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href={`/dashboard/vehicles/${item.id}`}>
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </Link>
                  </Button>
                  {canManage ? (
                    <Button variant="outline" asChild>
                      <Link href={`/dashboard/vehicles/${item.id}/edit`}>
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
              <div className="relative overflow-hidden rounded-[1.75rem] border border-primary/20 bg-[radial-gradient(circle_at_top,rgba(31,79,143,0.26),transparent_42%),linear-gradient(180deg,rgba(17,24,32,0.94),rgba(8,12,18,0.96))] p-6">
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary/70">
                  Responsavel
                </p>
                {item.assigned_to_profile ? (
                  <div className="mt-4 flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-white/10">
                      <AvatarImage src={item.assigned_to_profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(item.assigned_to_profile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {item.assigned_to_profile.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">Item alocado para operacao.</p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Nenhum responsavel atribuido no momento.
                  </p>
                )}
              </div>
            </div>
          </article>
        )}
        renderTable={
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veiculo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Atribuido a</TableHead>
                  <TableHead className="w-[190px]">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((item) => (
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
                          {item.model ? (
                            <div className="text-xs text-muted-foreground">
                              {item.model} {item.year && `(${item.year})`}
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
                      <span className="font-mono text-sm">{getVehiclePlate(item)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[item.status]}>
                        {statusLabels[item.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.assigned_to_profile ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={item.assigned_to_profile.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                              {getInitials(item.assigned_to_profile.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{item.assigned_to_profile.full_name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/vehicles/${item.id}`}>
                            <Eye className="h-4 w-4" />
                            Ver
                          </Link>
                        </Button>
                        {canManage ? (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/vehicles/${item.id}/edit`}>
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

      <DeleteVehicleDialog
        vehicleId={deleteId}
        open={!!deleteId}
        onOpenChange={(open: boolean) => !open && setDeleteId(null)}
      />
    </div>
  )
}
