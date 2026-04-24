'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Fingerprint, ScanFace, KeyRound, ShieldAlert,
  CheckCircle2, XCircle,
} from 'lucide-react'
import { FacialScan } from './facial-scan'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { RestrictedArea, Profile } from '@/lib/types/database'

interface AccessDialogProps {
  area: RestrictedArea | null
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: Profile | null
}

type Phase = 'idle' | 'pin-entry' | 'scanning' | 'video' | 'result'
type Result = 'granted' | 'denied'

export function AccessDialog({ area, open, onOpenChange, profile }: AccessDialogProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<Result | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [imgError, setImgError] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      setPhase('idle')
      setResult(null)
      setScanProgress(0)
      setPin('')
      setPinError('')
      setImgError(false)
    }
  }, [open])

  const level = area?.security_level ?? 'low'

  // ── Verificação de acesso no banco ────────────────────────────────────────
  const checkAccess = async (): Promise<boolean> => {
    if (!area || !profile) return false
    if (area.status === 'lockdown' && profile.role !== 'admin') return false

    // Maximum: apenas admins
    if (level === 'maximum' && profile.role !== 'admin') return false

    if (profile.role === 'admin') return true

    const now = new Date().toISOString()
    const { data } = await supabase
      .from('area_access')
      .select('id, expires_at')
      .eq('area_id', area.id)
      .eq('profile_id', profile.id)
      .single()

    if (!data) return false
    if (data.expires_at && data.expires_at < now) return false
    return true
  }

  const logResult = async (r: Result) => {
    if (!area || !profile) return
    await supabase.from('access_logs').insert([{
      area_id: area.id,
      profile_id: profile.id,
      access_type: r,
      details: { method: level, role: profile.role, security_level: level },
    }])
  }

  const finishWithResult = async (r: Result) => {
    setResult(r)
    setPhase('result')
    await logResult(r)
    if (r === 'granted') toast.success('Protocolo de acesso iniciado.')
    else toast.error('Incidente reportado à segurança local.')
  }

  // ── Low: barra de progresso ───────────────────────────────────────────────
  const startLowScan = () => {
    setPhase('scanning')
    let p = 0
    const iv = setInterval(async () => {
      p += 8
      setScanProgress(Math.min(p, 100))
      if (p >= 100) {
        clearInterval(iv)
        const ok = await checkAccess()
        await finishWithResult(ok ? 'granted' : 'denied')
      }
    }, 80)
  }

  // ── Medium: verificar PIN ─────────────────────────────────────────────────
  const handlePinSubmit = async () => {
    setPinError('')
    if (!profile?.pin) {
      setPinError('PIN não cadastrado. Contacte o administrador.')
      return
    }
    if (pin !== profile.pin) {
      setPinError('PIN incorreto.')
      return
    }
    const ok = await checkAccess()
    await finishWithResult(ok ? 'granted' : 'denied')
  }

  // ── High/Maximum: vídeo → resultado ──────────────────────────────────────
  const startFacialScan = async () => {
    // Maximum: bloquear não-admins imediatamente
    if (level === 'maximum' && profile?.role !== 'admin') {
      await finishWithResult('denied')
      return
    }
    setPhase('video')
  }

  const handleVideoEnd = async () => {
    const ok = await checkAccess()
    await finishWithResult(ok ? 'granted' : 'denied')
  }

  const handleClose = () => onOpenChange(false)

  // ── Labels por nível ──────────────────────────────────────────────────────
  const levelConfig = {
    low:     { label: 'Segurança Baixa',    icon: Fingerprint, btnLabel: 'Verificar Acesso',      btnIcon: Fingerprint },
    medium:  { label: 'Autenticação PIN',   icon: KeyRound,    btnLabel: 'Inserir PIN',            btnIcon: KeyRound    },
    high:    { label: 'Scan Facial',        icon: ScanFace,    btnLabel: 'Iniciar Scan Facial',    btnIcon: ScanFace    },
    maximum: { label: 'Autorização Máxima', icon: ShieldAlert, btnLabel: 'Validar Credencial',     btnIcon: ShieldAlert },
  }
  const cfg = levelConfig[level]

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-md border-border bg-background shadow-2xl shadow-primary/20 overflow-hidden p-0">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="font-mono text-xl tracking-tight uppercase flex items-center gap-2">
              Terminal de Acesso <cfg.icon className="h-4 w-4" />
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {area?.name} — {cfg.label}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* ── IDLE ── */}
        {phase === 'idle' && (
          <div className="flex flex-col items-center gap-6 px-6 pb-6">
            <div className="relative flex items-center justify-center w-28 h-28">
              <div className="absolute inset-0 rounded-full border-4 border-muted/30" />
              <cfg.icon className="h-14 w-14 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground font-mono text-center">
              {level === 'low'     && 'Verificação de credencial padrão.'}
              {level === 'medium'  && 'Insira o PIN de 4–6 dígitos atribuído ao seu perfil.'}
              {level === 'high'    && 'Scan biométrico facial obrigatório para acesso.'}
              {level === 'maximum' && 'Acesso restrito. Requer credencial de Administrador + Scan Facial.'}
            </p>
            <Button
              className="w-full font-mono uppercase tracking-wider"
              onClick={() => {
                if (level === 'low')    startLowScan()
                if (level === 'medium') setPhase('pin-entry')
                if (level === 'high' || level === 'maximum') startFacialScan()
              }}
            >
              <cfg.btnIcon className="mr-2 h-4 w-4" /> {cfg.btnLabel}
            </Button>
          </div>
        )}

        {/* ── PIN ENTRY (medium) ── */}
        {phase === 'pin-entry' && (
          <div className="flex flex-col items-center gap-4 px-6 pb-6">
            <KeyRound className="h-12 w-12 text-primary" />
            <p className="text-sm text-muted-foreground font-mono">Digite seu PIN de acesso</p>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="text-center text-2xl tracking-[0.5em] font-mono w-40"
              onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
              autoFocus
            />
            {pinError && <p className="text-sm text-destructive font-mono">{pinError}</p>}
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1 font-mono" onClick={handleClose}>Cancelar</Button>
              <Button className="flex-1 font-mono uppercase" onClick={handlePinSubmit} disabled={pin.length < 4}>
                Confirmar
              </Button>
            </div>
          </div>
        )}

        {/* ── SCANNING (low — barra de progresso) ── */}
        {phase === 'scanning' && (
          <div className="flex flex-col items-center gap-6 px-6 pb-6">
            <div className="relative flex items-center justify-center w-28 h-28">
              <div className="absolute inset-0 rounded-full border-4 border-primary animate-spin" />
              <Fingerprint className="h-14 w-14 text-primary animate-pulse" />
              <div
                className="absolute inset-x-0 bg-primary/20 h-1 transition-all duration-75"
                style={{ top: `${scanProgress}%` }}
              />
            </div>
            <div className="text-center font-mono">
              <p className="text-sm text-primary animate-pulse">Analisando credencial...</p>
              <p className="text-xs text-muted-foreground mt-1">{scanProgress}%</p>
            </div>
          </div>
        )}

        {/* ── VIDEO (high/maximum) ── */}
        {phase === 'video' && (
          <FacialScan onComplete={handleVideoEnd} />
        )}

        {/* ── RESULT ── */}
        {phase === 'result' && result && (
          <div className="flex flex-col items-center gap-4 px-6 pb-6">
            {!imgError ? (
              <img
                src={result === 'granted' ? '/acesso-autorizado.png' : '/acesso-negado.png'}
                alt={result === 'granted' ? 'Acesso Autorizado' : 'Acesso Negado'}
                className="w-full rounded-lg"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className={`flex flex-col items-center gap-3 py-6 w-full rounded-lg ${
                result === 'granted' ? 'bg-green-950/40' : 'bg-red-950/40'
              }`}>
                {result === 'granted'
                  ? <CheckCircle2 className="h-20 w-20 text-green-400" />
                  : <XCircle className="h-20 w-20 text-destructive" />
                }
                <p className={`text-xl font-bold font-mono uppercase tracking-widest ${
                  result === 'granted' ? 'text-green-400' : 'text-destructive'
                }`}>
                  {result === 'granted' ? 'Acesso Autorizado' : 'Acesso Negado'}
                </p>
                {result === 'granted' && (
                  <p className="text-xs text-green-400/70 font-mono">Bem-vindo, {profile?.full_name}</p>
                )}
                {result === 'denied' && level === 'maximum' && profile?.role !== 'admin' && (
                  <p className="text-xs text-destructive/70 font-mono">Credencial de nível máximo necessária</p>
                )}
              </div>
            )}
            <Button variant="outline" className="w-full font-mono uppercase tracking-wider" onClick={handleClose}>
              Fechar Terminal
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
