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
import type { Equipment, Profile, ResourceStatus } from '@/lib/types/database'
import { equipmentSchema, extractFieldErrors } from '@/lib/validations'
import { logActivity } from '@/lib/log-activity'

interface EquipmentFormProps {
  equipment?: Equipment
  profiles: Profile[]
  userId: string
}

const UNASSIGNED_VALUE = 'unassigned'

const CATEGORIES = [
  { value: 'tech', label: 'Tecnologia' },
  { value: 'security', label: 'Seguranca' },
  { value: 'communication', label: 'Comunicacao' },
  { value: 'transport', label: 'Transporte' },
  { value: 'lab', label: 'Laboratorio' },
  { value: 'other', label: 'Outros' },
]

const STATUSES: { value: ResourceStatus; label: string }[] = [
  { value: 'available', label: 'Disponivel' },
  { value: 'in_use', label: 'Em Uso' },
  { value: 'maintenance', label: 'Manutencao' },
  { value: 'retired', label: 'Aposentado' },
]

export function EquipmentForm({ equipment, profiles, userId }: EquipmentFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!equipment

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: equipment?.name || '',
    description: equipment?.description || '',
    category: equipment?.category || 'tech',
    status: equipment?.status || 'available',
    serial_number: equipment?.serial_number || '',
    location: equipment?.location || '',
    assigned_to: equipment?.assigned_to || UNASSIGNED_VALUE,
    image_url: equipment?.image_url || '',
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validation = equipmentSchema.safeParse(formData)
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
        category: formData.category,
        status: formData.status as ResourceStatus,
        serial_number: formData.serial_number || null,
        location: formData.location || null,
        assigned_to: formData.assigned_to === UNASSIGNED_VALUE ? null : formData.assigned_to,
        image_url: formData.image_url || null,
        ...(isEditing ? {} : { created_by: userId }),
      }

      if (isEditing) {
        const { error } = await supabase
          .from('equipment')
          .update(data)
          .eq('id', equipment.id)

        if (error) throw error
        await logActivity(supabase, userId, 'update', 'equipment', equipment.id, { name: data.name, status: data.status })
        toast.success('Equipamento atualizado com sucesso')
      } else {
        const { data: inserted, error } = await supabase
          .from('equipment')
          .insert(data)
          .select('id')
          .single()

        if (error) throw error
        await logActivity(supabase, userId, 'create', 'equipment', inserted?.id ?? null, { name: data.name, category: data.category })
        toast.success('Equipamento criado com sucesso')
      }

      router.push('/dashboard/equipment')
      router.refresh()
    } catch (error) {
      console.error('Error saving equipment:', error)
      toast.error(isEditing ? 'Erro ao atualizar equipamento' : 'Erro ao criar equipamento')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/equipment">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isEditing ? 'Editar Equipamento' : 'Novo Equipamento'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? 'Atualize as informacoes do equipamento' : 'Cadastre um novo equipamento no sistema'}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informacoes do Equipamento</CardTitle>
          <CardDescription>
            Preencha os dados do equipamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do equipamento"
                  aria-invalid={!!fieldErrors.name}
                />
                {fieldErrors.name && <p className="text-sm text-destructive">{fieldErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial_number">Numero de Serie</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  placeholder="Ex: WI-2024-001"
                />
                {fieldErrors.serial_number && <p className="text-sm text-destructive">{fieldErrors.serial_number}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger aria-invalid={!!fieldErrors.category}>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.category && <p className="text-sm text-destructive">{fieldErrors.category}</p>}
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
                <Label htmlFor="location">Localizacao</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Torre Wayne - Andar 15"
                />
                {fieldErrors.location && <p className="text-sm text-destructive">{fieldErrors.location}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Caminho da Imagem</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Ex: /equipamentos/drone.png"
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
                    <SelectValue placeholder="Selecione um funcionario" />
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
                placeholder="Descreva o equipamento..."
                rows={4}
              />
              {fieldErrors.description && <p className="text-sm text-destructive">{fieldErrors.description}</p>}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Salvando...' : 'Criando...'}
                  </>
                ) : (
                  isEditing ? 'Salvar Alteracoes' : 'Criar Equipamento'
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/equipment">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
