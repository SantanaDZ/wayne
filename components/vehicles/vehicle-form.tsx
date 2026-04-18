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
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Vehicle, Profile, ResourceStatus } from '@/lib/types/database'
import { vehicleSchema, extractFieldErrors } from '@/lib/validations'
import { logActivity } from '@/lib/log-activity'

interface VehicleFormProps {
  vehicle?: Vehicle
  profiles: Profile[]
  userId: string
}

const UNASSIGNED_VALUE = 'unassigned'

const TYPES = [
  { value: 'car', label: 'Carro' },
  { value: 'suv', label: 'SUV' },
  { value: 'truck', label: 'Caminhao' },
  { value: 'motorcycle', label: 'Motocicleta' },
  { value: 'helicopter', label: 'Helicoptero' },
  { value: 'aircraft', label: 'Aeronave' },
  { value: 'boat', label: 'Barco' },
  { value: 'other', label: 'Outro' },
]

const STATUSES: { value: ResourceStatus; label: string }[] = [
  { value: 'available', label: 'Disponivel' },
  { value: 'in_use', label: 'Em Uso' },
  { value: 'maintenance', label: 'Manutencao' },
  { value: 'retired', label: 'Aposentado' },
]

export function VehicleForm({ vehicle, profiles, userId }: VehicleFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!vehicle

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: vehicle?.name || '',
    description: vehicle?.description || '',
    type: vehicle?.type || 'car',
    status: vehicle?.status || 'available',
    license_plate: vehicle?.plate_number || '', // Uses plate_number from type, but maps to license_plate in DB
    model: vehicle?.model || '',
    year: vehicle?.year || '',
    location: vehicle?.location || '',
    assigned_to: vehicle?.assigned_to || UNASSIGNED_VALUE,
    image_url: vehicle?.image_url || '',
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validation = vehicleSchema.safeParse(formData)
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
        status: formData.status as ResourceStatus,
        plate_number: formData.license_plate || null,
        model: formData.model || null,
        year: formData.year ? parseInt(formData.year.toString()) : null,
        location: formData.location || null,
        assigned_to: formData.assigned_to === UNASSIGNED_VALUE ? null : formData.assigned_to,
        image_url: formData.image_url || null,
        ...(isEditing ? {} : { created_by: userId }),
      }

      if (isEditing) {
        const { error } = await supabase
          .from('vehicles')
          .update(data)
          .eq('id', vehicle.id)

        if (error) throw error
        await logActivity(supabase, userId, 'update', 'vehicle', vehicle.id, { name: data.name, status: data.status })
        toast.success('Veiculo atualizado com sucesso')
      } else {
        const { data: inserted, error } = await supabase
          .from('vehicles')
          .insert(data)
          .select('id')
          .single()

        if (error) throw error
        await logActivity(supabase, userId, 'create', 'vehicle', inserted?.id ?? null, { name: data.name, type: data.type })
        toast.success('Veiculo cadastrado com sucesso')
      }

      router.push('/dashboard/vehicles')
      router.refresh()
    } catch (error) {
      console.error('Error saving vehicle:', JSON.stringify(error))
      toast.error(isEditing ? 'Erro ao atualizar veiculo' : 'Erro ao cadastrar veiculo')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/vehicles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isEditing ? 'Editar Veiculo' : 'Novo Veiculo'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? 'Atualize as informacoes do veiculo na frota' : 'Cadastre um novo veiculo na frota da Wayne Enterprises'}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informacoes do Veiculo</CardTitle>
          <CardDescription>
            Preencha os detalhes tecnicos do veiculo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome/Identificacao *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Batmovel Tumbler 01"
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
                <Label htmlFor="license_plate">Placa</Label>
                <Input
                  id="license_plate"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                  placeholder="Ex: WYN-0001"
                />
                {fieldErrors.license_plate && <p className="text-sm text-destructive">{fieldErrors.license_plate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as ResourceStatus })}
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
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Ex: WayneTech Interceptor"
                />
                {fieldErrors.model && <p className="text-sm text-destructive">{fieldErrors.model}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Ano</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="Ex: 2026"
                />
                {fieldErrors.year && <p className="text-sm text-destructive">{fieldErrors.year}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localizacao</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Batcaverna - Garagem Sul"
                />
                {fieldErrors.location && <p className="text-sm text-destructive">{fieldErrors.location}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Caminho da Imagem</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Ex: /veiculos/batmovel.png"
                />
                {fieldErrors.image_url && <p className="text-sm text-destructive">{fieldErrors.image_url}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to">Atribuir a</Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um perfil responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED_VALUE}>Nenhum</SelectItem>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes adicionais, modificacoes especiais..."
                rows={4}
              />
              {fieldErrors.description && <p className="text-sm text-destructive">{fieldErrors.description}</p>}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Salvando...' : 'Cadastrando...'}
                  </>
                ) : (
                  isEditing ? 'Salvar Alteracoes' : 'Cadastrar Veiculo'
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/vehicles">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
