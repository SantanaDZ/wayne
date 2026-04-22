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
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createLocationAction, updateLocationAction } from '@/app/dashboard/departments/actions'
import type { DepartmentLocation } from '@/lib/types/database'

interface LocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  departmentId: string
  departmentName: string
  location?: DepartmentLocation
}

export function LocationDialog({ open, onOpenChange, departmentId, departmentName, location }: LocationDialogProps) {
  const [name, setName] = useState(location?.name ?? '')
  const [isLoading, setIsLoading] = useState(false)

  const isEdit = !!location

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsLoading(true)

    const result = isEdit
      ? await updateLocationAction({ id: location.id, name })
      : await createLocationAction({ department_id: departmentId, name })

    setIsLoading(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success(isEdit ? 'Local atualizado.' : 'Local criado.')
    onOpenChange(false)
    if (!isEdit) setName('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Local' : `Novo Local — ${departmentName}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loc-name">Nome *</Label>
            <Input
              id="loc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Torre Wayne"
              required
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
