'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Pencil, Trash2, MapPin, Tag, Calendar, ShieldAlert } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { SecurityDevice, DeviceStatus } from '@/lib/types/database'
import { DeleteDeviceDialog } from './delete-device-dialog'

interface SecurityDeviceDetailsProps {
  device: SecurityDevice
  canManage: boolean
  canDelete: boolean
}

const statusLabels: Record<DeviceStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  maintenance: 'Manutenção',
}

const statusColors: Record<DeviceStatus, string> = {
  active: 'bg-wayne-success/20 text-wayne-success border-wayne-success/30',
  inactive: 'bg-muted text-muted-foreground border-muted-foreground/30',
  maintenance: 'bg-wayne-warning/20 text-wayne-warning border-wayne-warning/30',
}

const typeLabels: Record<string, string> = {
  camera: 'Câmera',
  sensor: 'Sensor',
  biometric: 'Biometria',
  alarm: 'Alarme',
  other: 'Outros',
}

export function SecurityDeviceDetails({ device, canManage, canDelete }: SecurityDeviceDetailsProps) {
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
            <Link href="/dashboard/security-devices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldAlert className="h-8 w-8 text-wayne-warning" />
              {device.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Ficha técnica do dispositivo de segurança
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canManage && (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/security-devices/${device.id}/edit`}>
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
        <Card className="lg:col-span-2 border-wayne-warning/10">
          <CardHeader>
            <CardTitle>Informações do Dispositivo</CardTitle>
            <CardDescription>Especificações de hardware e rede</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className={`${statusColors[device.status]} text-sm px-3 py-1`}>
                {statusLabels[device.status]}
              </Badge>
              <Badge variant="secondary">
                {typeLabels[device.type] || device.type}
              </Badge>
            </div>

            {device.image_url && (
              <div className="rounded-lg overflow-hidden border border-border mt-4 mb-4 bg-muted/30">
                <img 
                  src={device.image_url} 
                  alt={device.name} 
                  className="w-full h-auto max-h-[400px] object-contain mx-auto"
                />
              </div>
            )}

            {device.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h3>
                <p className="text-foreground">{device.description}</p>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {device.ip_address && (
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Endereço IP</p>
                    <p className="font-medium font-mono text-lg text-wayne-warning">{device.ip_address}</p>
                  </div>
                </div>
              )}

              {device.serial_number && (
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nº de Série (Hardware ID)</p>
                    <p className="font-medium">{device.serial_number}</p>
                  </div>
                </div>
              )}

              {device.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Localização Física</p>
                    <p className="font-medium">{device.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Última Manutenção</p>
                  <p className="font-medium">
                    {device.last_maintenance 
                      ? format(new Date(device.last_maintenance), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : 'Nenhuma manutenção registrada'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {device.created_by_profile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Registrado por</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={device.created_by_profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                      {getInitials(device.created_by_profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{device.created_by_profile.full_name}</p>
                    <p className="text-xs text-muted-foreground">Administrador de Redes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-wayne-warning/5 border-wayne-warning/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Aviso de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Este dispositivo faz parte da rede crítica da WayneTech. Qualquer tentativa de acesso não autorizado ou manipulação física disparará protocolos de contenção.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <DeleteDeviceDialog
        deviceId={device.id}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </div>
  )
}
