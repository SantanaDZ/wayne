'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createDepartmentAction, updateDepartmentAction } from '@/app/dashboard/departments/actions'
import type { Department } from '@/lib/types/database'

interface DepartmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  department?: Department
}

export function DepartmentDialog({ open, onOpenChange, department }: DepartmentDialogProps) {
  const [name, setName] = useState(department?.name ?? '')
  const [description, setDescription] = useState(department?.description ?? '')
  const [isLoading, setIsLoading] = useState(false)

  const isEdit = !!department

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsLoading(true)

    const result = isEdit
      ? await updateDepartmentAction({ id: department.id, name, description })
      : await createDepartmentAction({ name, description })

    setIsLoading(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success(isEdit ? 'Departamento atualizado.' : 'Departamento criado.')
    onOpenChange(false)
    if (!isEdit) { setName(''); setDescription('') }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Departamento' : 'Novo Departamento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dept-name">Nome *</Label>
            <Input
              id="dept-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pesquisa e Desenvolvimento"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept-desc">Descrição</Label>
            <Textarea
              id="dept-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição opcional do departamento"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
