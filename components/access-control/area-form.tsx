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
import type { RestrictedArea, SecurityLevel, AreaStatus } from '@/lib/types/database'

interface AreaFormProps {
  area?: RestrictedArea
}

const SECURITY_LEVELS: { value: SecurityLevel; label: string }[] = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'maximum', label: 'Maxima' },
]

const STATUSES: { value: AreaStatus; label: string }[] = [
  { value: 'operational', label: 'Operacional' },
  { value: 'lockdown', label: 'Bloqueio Total (Lockdown)' },
  { value: 'maintenance', label: 'Manutencao' },
]

export function AreaForm({ area }: AreaFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!area

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: area?.name || '',
    description: area?.description || '',
    security_level: area?.security_level || 'low' as SecurityLevel,
    status: area?.status || 'operational' as AreaStatus,
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const data = {
        name: formData.name,
        description: formData.description || null,
        security_level: formData.security_level,
        status: formData.status,
      }

      if (isEditing) {
        const { error } = await supabase
          .from('restricted_areas')
          .update(data)
          .eq('id', area.id)

        if (error) throw error
        toast.success('Area restrita atualizada com sucesso')
      } else {
        const { error } = await supabase
          .from('restricted_areas')
          .insert(data)

        if (error) throw error
        toast.success('Area restrita cadastrada com sucesso')
      }

      router.push('/dashboard/access-control')
      router.refresh()
    } catch (error) {
      console.error('Error saving area:', error)
      toast.error(isEditing ? 'Erro ao atualizar area restrita' : 'Erro ao cadastrar area restrita')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/access-control">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isEditing ? 'Editar Area Restrita' : 'Nova Area Restrita'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? 'Atualize as informacoes do setor' : 'Cadastre um novo setor nas Industrias Wayne'}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informacoes da Area / Setor</CardTitle>
          <CardDescription>
            Defina o nome e o nivel de risco/acesso do setor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Area *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Laboratorio P&D (Armas)"
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                {/* Space filler to align properly */}
              </div>

              <div className="space-y-2">
                <Label htmlFor="security_level">Nivel de Seguranca *</Label>
                <Select
                  value={formData.security_level}
                  onValueChange={(value) => setFormData({ ...formData, security_level: value as SecurityLevel })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECURITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status da Area *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as AreaStatus })}
                >
                  <SelectTrigger>
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
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descricao (Opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Finalidade desta area ou restricao detalhada..."
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Salvando...' : 'Cadastrando...'}
                  </>
                ) : (
                  isEditing ? 'Salvar Alteracoes' : 'Cadastrar Area'
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/access-control">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
