'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { logActivity } from '@/lib/log-activity'
import { Loader2 } from 'lucide-react'

interface DeleteEquipmentDialogProps {
  equipmentId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteEquipmentDialog({
  equipmentId,
  open,
  onOpenChange,
}: DeleteEquipmentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!equipmentId) return

    setIsDeleting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', equipmentId)

      if (error) throw error
      if (user) await logActivity(supabase, user.id, 'delete', 'equipment', equipmentId)
      toast.success('Equipamento excluido com sucesso')
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Error deleting equipment:', error)
      toast.error('Erro ao excluir equipamento')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusao</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este equipamento? Esta acao nao pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              'Excluir'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
