'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import type { SecurityDevice, DeviceStatus } from '@/lib/types/database'
import { securityDeviceSchema, extractFieldErrors } from '@/lib/validations'
import { logActivity } from '@/lib/log-activity'

interface SecurityDeviceFormProps {
  device?: SecurityDevice
  userId: string
}

const TYPES = [
  { value: 'camera', label: 'Câmera Térmica/Visual' },
  { value: 'sensor', label: 'Sensor Sismológico/Movimento' },
  { value: 'biometric', label: 'Scanner Biométrico/Retina' },
  { value: 'alarm', label: 'Sistema de Alarme/Torreta' },
  { value: 'other', label: 'Outro' },
]

const STATUSES: { value: DeviceStatus; label: string }[] = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'maintenance', label: 'Manutenção' },
]

export function SecurityDeviceForm({ device, userId }: SecurityDeviceFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!device

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: device?.name || '',
    description: device?.description || '',
    type: device?.type || 'camera',
    status: device?.status || 'active',
    serial_number: device?.serial_number || '',
    location: device?.location || '',
    ip_address: device?.ip_address || '',
    image_url: device?.image_url || '',
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validation = securityDeviceSchema.safeParse(formData)
    if (!validation.success) {
      setFieldErrors(extractFieldErrors(validation.error))
      return
    }
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      const data = {
        name: formData.name,
        description: formData.description || null,
        type: formData.type,
        status: formData.status as DeviceStatus,
        serial_number: formData.serial_number || null,
        location: formData.location,
        ip_address: formData.ip_address || null,
        image_url: formData.image_url || null,
        ...(isEditing ? {} : { created_by: userId }),
      }

      if (isEditing) {
        const { error } = await supabase
          .from('security_devices')
          .update(data)
          .eq('id', device.id)

        if (error) throw error
        await logActivity(supabase, userId, 'update', 'security_device', device.id, { name: data.name, status: data.status })
        toast.success('Dispositivo atualizado com sucesso')
      } else {
        const { data: inserted, error } = await supabase
          .from('security_devices')
          .insert(data)
          .select('id')
          .single()

        if (error) throw error
        await logActivity(supabase, userId, 'create', 'security_device', inserted?.id ?? null, { name: data.name, type: data.type, location: data.location })
        toast.success('Dispositivo cadastrado com sucesso')
      }

      router.push('/dashboard/security-devices')
      router.refresh()
    } catch (error) {
      console.error('Error saving device:', error)
      toast.error(isEditing ? 'Erro ao atualizar dispositivo' : 'Erro ao cadastrar dispositivo')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/security-devices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-wayne-warning" />
            {isEditing ? 'Editar Dispositivo' : 'Novo Dispositivo de Seguranca'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? 'Atualize as credenciais do dispositivo' : 'Implante um novo hardware na rede de protecao da WayneTech'}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl border-wayne-warning/20">
        <CardHeader>
          <CardTitle>Detalhes do Hardware</CardTitle>
          <CardDescription>
            Defina o protocolo, rede e localização do sensor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Dispositivo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Câmera Térmica Norte"
                  aria-invalid={!!fieldErrors.name}
                />
                {fieldErrors.name && <p className="text-sm text-destructive">{fieldErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger aria-invalid={!!fieldErrors.type}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.type && <p className="text-sm text-destructive">{fieldErrors.type}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial_number">Série (Hardware ID)</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  placeholder="Ex: WT-CAM-009A"
                />
                {fieldErrors.serial_number && <p className="text-sm text-destructive">{fieldErrors.serial_number}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status da Rede *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as DeviceStatus })}
                >
                  <SelectTrigger aria-invalid={!!fieldErrors.status}>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.status && <p className="text-sm text-destructive">{fieldErrors.status}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localização *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Nível 3 - Corredor Leste"
                  aria-invalid={!!fieldErrors.location}
                />
                {fieldErrors.location && <p className="text-sm text-destructive">{fieldErrors.location}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ip_address">Endereço IP</Label>
                <Input
                  id="ip_address"
                  value={formData.ip_address}
                  onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                  placeholder="192.168.1.100"
                />
                {fieldErrors.ip_address && <p className="text-sm text-destructive">{fieldErrors.ip_address}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Caminho da Imagem</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Ex: /dispositivos/camera.png"
                />
                {fieldErrors.image_url && <p className="text-sm text-destructive">{fieldErrors.image_url}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Observações sobre o ângulo de visão, cobertura ou restrições..."
                rows={4}
              />
              {fieldErrors.description && <p className="text-sm text-destructive">{fieldErrors.description}</p>}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting} className="bg-wayne-warning hover:bg-wayne-warning/90 text-wayne-dark font-bold">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin flex" />
                    {isEditing ? 'Sincronizando...' : 'Implantando Dispositivo...'}
                  </>
                ) : (
                  isEditing ? 'Salvar Configuração' : 'Implantar Dispositivo'
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/security-devices">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
