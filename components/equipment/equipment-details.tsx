'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Pencil, Trash2, MapPin, Tag, Calendar, User } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Equipment, ResourceStatus } from '@/lib/types/database'
import { DeleteEquipmentDialog } from './delete-equipment-dialog'

interface EquipmentDetailsProps {
  equipment: Equipment
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

const categoryLabels: Record<string, string> = {
  tech: 'Tecnologia',
  security: 'Seguranca',
  communication: 'Comunicacao',
  transport: 'Transporte',
  lab: 'Laboratorio',
  other: 'Outros',
}

export function EquipmentDetails({ equipment, canManage, canDelete }: EquipmentDetailsProps) {
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
            <Link href="/dashboard/equipment">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {equipment.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Detalhes do equipamento
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canManage && (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/equipment/${equipment.id}/edit`}>
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
            <CardTitle>Informacoes Gerais</CardTitle>
            <CardDescription>Dados principais do equipamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className={`${statusColors[equipment.status]} text-sm px-3 py-1`}>
                {statusLabels[equipment.status]}
              </Badge>
              <Badge variant="secondary">
                {categoryLabels[equipment.category] || equipment.category}
              </Badge>
            </div>

            {equipment.image_url && (
              <div className="rounded-lg overflow-hidden border border-border mt-4 mb-4">
                <img
                  src={equipment.image_url}
                  alt={equipment.name}
                  className="w-full h-auto max-h-[600px] object-cover"
                />
              </div>
            )}

            {equipment.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Descricao</h3>
                <p className="text-foreground">{equipment.description}</p>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equipment.serial_number && (
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Numero de Serie</p>
                    <p className="font-medium">{equipment.serial_number}</p>
                  </div>
                </div>
              )}

              {equipment.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Localizacao</p>
                    <p className="font-medium">{equipment.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Criado em</p>
                  <p className="font-medium">
                    {format(new Date(equipment.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Ultima atualizacao</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(equipment.updated_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {equipment.assigned_to_profile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Atribuido a</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={equipment.assigned_to_profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(equipment.assigned_to_profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{equipment.assigned_to_profile.full_name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {equipment.assigned_to_profile.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {equipment.created_by_profile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Criado por</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={equipment.created_by_profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                      {getInitials(equipment.created_by_profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{equipment.created_by_profile.full_name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <DeleteEquipmentDialog
        equipmentId={equipment.id}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </div>
  )
}
