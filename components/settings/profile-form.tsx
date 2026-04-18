'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, User } from 'lucide-react'
import type { Profile } from '@/lib/types/database'

interface ProfileFormProps {
  profile: Profile
  userId: string
  email: string
}

const DEPARTMENTS = [
  { value: 'engineering', label: 'Engenharia' },
  { value: 'security', label: 'Segurança' },
  { value: 'research', label: 'Pesquisa & Desenvolvimento' },
  { value: 'operations', label: 'Operações' },
  { value: 'finance', label: 'Finanças' },
  { value: 'executive', label: 'Executivo' },
  { value: 'other', label: 'Outro' },
]

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  employee: 'Funcionário',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name ?? '',
    department: profile?.department ?? '',
    avatar_url: profile?.avatar_url ?? '',
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.full_name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim(),
          department: formData.department || null,
          avatar_url: formData.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error
      toast.success('Perfil atualizado com sucesso')
      router.refresh()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Erro ao atualizar perfil')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>Suas informações pessoais no sistema</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border border-border">
              <AvatarImage src={formData.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {getInitials(formData.full_name || email)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="font-medium text-foreground">{formData.full_name || '—'}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
              <Badge variant="outline" className="text-xs capitalize">
                {ROLE_LABELS[profile?.role] ?? profile?.role}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                disabled
                className="opacity-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o departamento" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Cargo</Label>
              <Input
                id="role"
                value={ROLE_LABELS[profile?.role] ?? profile?.role}
                disabled
                className="opacity-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="avatar_url">URL do avatar</Label>
              <Input
                id="avatar_url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://exemplo.com/foto.png"
              />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Perfil'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
