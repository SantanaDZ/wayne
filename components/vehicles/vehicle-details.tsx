'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Pencil, Trash2, MapPin, Tag, Calendar, Car } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Vehicle, ResourceStatus } from '@/lib/types/database'
import { DeleteVehicleDialog } from './delete-vehicle-dialog'

interface VehicleDetailsProps {
  vehicle: Vehicle
  canManage: boolean
  canDelete: boolean
}

const statusLabels: Record<ResourceStatus, string> = {
  available: 'Disponível',
  in_use: 'Em Uso',
  maintenance: 'Manutenção',
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
  truck: 'Caminhão',
  motorcycle: 'Motocicleta',
  helicopter: 'Helicóptero',
  aircraft: 'Aeronave',
  boat: 'Barco',
  other: 'Outro',
}

export function VehicleDetails({ vehicle, canManage, canDelete }: VehicleDetailsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/vehicles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Car className="h-8 w-8 text-primary" />
              {vehicle.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Ficha técnica do veículo
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canManage && (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/vehicles/${vehicle.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações do Veículo</CardTitle>
            <CardDescription>Especificações e status operacional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className={`${statusColors[vehicle.status]} text-sm px-3 py-1`}>
                {statusLabels[vehicle.status]}
              </Badge>
              <Badge variant="secondary">
                {typeLabels[vehicle.type] || vehicle.type}
              </Badge>
            </div>

            {vehicle.image_url && (
              <div className="rounded-lg overflow-hidden border border-border mt-4 mb-4 bg-muted">
                <img 
                  src={vehicle.image_url} 
                  alt={vehicle.name} 
                  className="w-full h-auto max-h-[400px] object-contain mx-auto"
                />
              </div>
            )}

            {vehicle.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h3>
                <p className="text-foreground">{vehicle.description}</p>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicle.plate_number && (
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Placa / Registro</p>
                    <p className="font-medium font-mono uppercase text-lg text-primary">{vehicle.plate_number}</p>
                  </div>
                </div>
              )}

              {vehicle.model && (
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Modelo</p>
                    <p className="font-medium">{vehicle.model} {vehicle.year && `(${vehicle.year})`}</p>
                  </div>
                </div>
              )}

              {vehicle.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Estacionamento / Garagem</p>
                    <p className="font-medium">{vehicle.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Registrado em</p>
                  <p className="font-medium">
                    {format(new Date(vehicle.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {vehicle.assigned_to_profile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Operador / Condutor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={vehicle.assigned_to_profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(vehicle.assigned_to_profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{vehicle.assigned_to_profile.full_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {vehicle.assigned_to_profile.role} • {vehicle.assigned_to_profile.department || 'Serviços Gerais'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {vehicle.created_by_profile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Registrado por</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={vehicle.created_by_profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                      {getInitials(vehicle.created_by_profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{vehicle.created_by_profile.full_name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <DeleteVehicleDialog
        vehicleId={vehicle.id}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </div>
  )
}
