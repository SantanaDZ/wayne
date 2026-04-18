'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Fingerprint, ScanFace, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react'
import type { RestrictedArea, Profile } from '@/lib/types/database'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface BiometricAccessDialogProps {
  area: RestrictedArea | null
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: Profile | null
}

type ScanStatus = 'idle' | 'scanning' | 'success' | 'denied'

export function BiometricAccessDialog({ area, open, onOpenChange, profile }: BiometricAccessDialogProps) {
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle')
  const [scanProgress, setScanProgress] = useState(0)
  const supabase = createClient()

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setScanStatus('idle')
      setScanProgress(0)
    }
  }, [open])

  const checkAccess = async (): Promise<boolean> => {
    if (!area || !profile) return false

    // Admin sempre tem acesso
    if (profile.role === 'admin') return true

    // Área em lockdown: somente admin (bloqueado acima)
    if (area.status === 'lockdown') return false

    // Consulta real na tabela area_access
    const now = new Date().toISOString()
    const { data } = await supabase
      .from('area_access')
      .select('id, expires_at')
      .eq('area_id', area.id)
      .eq('profile_id', profile.id)
      .single()

    if (!data) return false

    // Verifica se o acesso não expirou
    if (data.expires_at && data.expires_at < now) return false

    return true
  }

  const handleScan = () => {
    setScanStatus('scanning')
    let progress = 0

    const interval = setInterval(async () => {
      progress += 5
      setScanProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)

        const hasAccess = await checkAccess()
        setScanStatus(hasAccess ? 'success' : 'denied')

        if (area && profile) {
          supabase.from('access_logs').insert([{
            area_id: area.id,
            profile_id: profile.id,
            access_type: hasAccess ? 'granted' : 'denied',
            details: { method: 'biometric', role: profile.role, security_level: area.security_level }
          }]).then(() => {})
        }
      }
    }, 100)
  }

  const handleClose = () => {
    if (scanStatus === 'success') {
      toast.success('Protocolo de acesso iniciado. Desativando medidas letais na porta...')
    } else if (scanStatus === 'denied') {
      toast.error('O incidente de intrusao foi reportado aos segurancas no local.')
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) handleClose()
    }}>
      <DialogContent className="sm:max-w-md border-border bg-background shadow-2xl shadow-primary/20">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl tracking-tight uppercase flex items-center gap-2">
            Terminal de Acesso <ShieldAlert className="h-4 w-4" />
          </DialogTitle>
          <DialogDescription className="font-mono">
            {area?.name} - {area?.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-10 space-y-6">
          
          <div className="relative flex items-center justify-center w-32 h-32">
            {/* The Scanner Ring */}
            <div className={`absolute inset-0 rounded-full border-4 transition-all duration-300 ${
              scanStatus === 'idle' ? 'border-muted/30' :
              scanStatus === 'scanning' ? 'border-primary animate-spin' :
              scanStatus === 'success' ? 'border-wayne-success shadow-[0_0_15px_rgba(var(--wayne-success),0.5)]' :
              'border-destructive shadow-[0_0_15px_rgba(var(--destructive),0.5)]'
            }`} />
            
            {/* Inner Icon */}
            <div className="absolute inset-0 flex items-center justify-center z-10 transition-colors">
              {scanStatus === 'idle' || scanStatus === 'scanning' ? (
                <Fingerprint className={`h-16 w-16 ${scanStatus === 'scanning' ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
              ) : scanStatus === 'success' ? (
                <CheckCircle2 className="h-16 w-16 text-wayne-success" />
              ) : (
                <XCircle className="h-16 w-16 text-destructive" />
              )}
            </div>

            {/* Sweep overlay for scanning */}
            {scanStatus === 'scanning' && (
              <div 
                className="absolute inset-x-0 bg-primary/20 h-1 z-20 transition-all duration-75"
                style={{ top: `${scanProgress}%` }}
              />
            )}
          </div>

          <div className="text-center font-mono space-y-2 h-16">
            {scanStatus === 'idle' && (
              <p className="text-sm text-muted-foreground typewriter">Aguardando autorizacao local...</p>
            )}
            {scanStatus === 'scanning' && (
              <>
                <p className="text-sm text-primary animate-pulse">Analisando padrao biometrico...</p>
                <p className="text-xs text-muted-foreground">{scanProgress}%</p>
              </>
            )}
            {scanStatus === 'success' && (
              <>
                <p className="text-lg font-bold text-wayne-success uppercase">Acesso Concedido</p>
                <p className="text-xs text-wayne-success/70">Bem vindo, {profile?.full_name}</p>
              </>
            )}
            {scanStatus === 'denied' && (
              <>
                <p className="text-lg font-bold text-destructive uppercase">Acesso Negado</p>
                <p className="text-xs text-destructive/70">Nivel de credencial insuficiente.</p>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-2">
          {scanStatus === 'idle' ? (
            <Button onClick={handleScan} className="w-full bg-primary text-primary-foreground font-mono uppercase tracking-wider hover:bg-primary/80">
              <ScanFace className="mr-2 h-4 w-4" /> Iniciar Escaneamento
            </Button>
          ) : (
            <Button onClick={handleClose} variant="outline" className="w-full font-mono uppercase tracking-wider">
              {scanStatus === 'scanning' ? 'Cancelar' : 'Fechar Terminal'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
