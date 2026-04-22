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
import { createSectorAction, updateSectorAction } from '@/app/dashboard/departments/actions'
import type { DepartmentSector } from '@/lib/types/database'

interface SectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locationId: string
  locationName: string
  sector?: DepartmentSector
}

export function SectorDialog({ open, onOpenChange, locationId, locationName, sector }: SectorDialogProps) {
  const [name, setName] = useState(sector?.name ?? '')
  const [isLoading, setIsLoading] = useState(false)

  const isEdit = !!sector

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsLoading(true)

    const result = isEdit
      ? await updateSectorAction({ id: sector.id, name })
      : await createSectorAction({ location_id: locationId, name })

    setIsLoading(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success(isEdit ? 'Setor atualizado.' : 'Setor criado.')
    onOpenChange(false)
    if (!isEdit) setName('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Setor' : `Novo Setor — ${locationName}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sector-name">Nome *</Label>
            <Input
              id="sector-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Laboratório"
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
