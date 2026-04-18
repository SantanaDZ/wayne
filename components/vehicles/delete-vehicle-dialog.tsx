'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logActivity } from '@/lib/log-activity'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface DeleteVehicleDialogProps {
  vehicleId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteVehicleDialog({ vehicleId, open, onOpenChange }: DeleteVehicleDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!vehicleId) return
    try {
      setIsDeleting(true)
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('vehicles').delete().eq('id', vehicleId)
      if (error) throw error
      if (user) await logActivity(supabase, user.id, 'delete', 'vehicle', vehicleId)
      toast.success('Veículo excluído com sucesso')
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      toast.error('Erro ao excluir veículo.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
          <AlertDialogDescription>
            Isso excluirá permanentemente o veículo da frota.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Excluindo...' : 'Excluir Veículo'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
