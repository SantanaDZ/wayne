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

interface DeleteDeviceDialogProps {
  deviceId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteDeviceDialog({ deviceId, open, onOpenChange }: DeleteDeviceDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!deviceId) return

    try {
      setIsDeleting(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('security_devices')
        .delete()
        .eq('id', deviceId)

      if (error) throw error
      if (user) await logActivity(supabase, user.id, 'delete', 'security_device', deviceId)
      toast.success('Dispositivo excluido com sucesso')
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Error deleting device:', error)
      toast.error('Erro ao excluir dispositivo. Tente novamente.')
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
            Isso excluirara permanentemente o dispositivo de seguranca do sistema e removera
            seus dados de nossos servidores. O monitoramento dessa area podera ser afetado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Excluindo...' : 'Excluir Dispositivo'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
