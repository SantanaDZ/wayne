'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KeyRound, ShieldAlert, ScanFace, CheckCircle2, XCircle, ArrowLeft, X } from 'lucide-react'
import { FacialScan } from './facial-scan'
import type { Profile } from '@/lib/types/database'
import type { SecurityLevel } from '@/app/dashboard/access-control/route-actions'

interface RouteChallengeProps {
  securityLevel: SecurityLevel
  routeLabel: string
  profile: Profile | null
  onGranted: () => void
  onClose: () => void
}

type Phase = 'pin' | 'scan' | 'result'
type Result = 'granted' | 'denied'

const titleMap: Record<SecurityLevel, string> = {
  low:     '',
  medium:  'Autenticação PIN',
  high:    'Scan Facial',
  maximum: 'Autorização Máxima',
}

export function RouteChallenge({ securityLevel, routeLabel, profile, onGranted, onClose }: RouteChallengeProps) {
  const [result, setResult] = useState<Result | null>(null)
  const [imgError, setImgError] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')

  // Determina fase inicial direto — sem tela idle
  const initialPhase = (): Phase => {
    if (securityLevel === 'medium') return 'pin'
    if (securityLevel === 'high') return 'scan'
    // maximum: não-admin nega imediatamente
    if (securityLevel === 'maximum') {
      return profile?.role === 'admin' ? 'scan' : 'result'
    }
    return 'scan'
  }
  const [phase, setPhase] = useState<Phase>(initialPhase)

  // Maximum não-admin: nega ao montar
  useEffect(() => {
    if (securityLevel === 'maximum' && profile?.role !== 'admin') {
      setResult('denied')
    }
  }, [securityLevel, profile])

  // Low: concede imediatamente (não deve chegar aqui, mas por segurança)
  useEffect(() => {
    if (securityLevel === 'low') onGranted()
  }, [securityLevel, onGranted])

  // Auto-avança para dashboard após concessão
  useEffect(() => {
    if (result === 'granted') {
      const t = setTimeout(onGranted, 1200)
      return () => clearTimeout(t)
    }
  }, [result, onGranted])

  const handlePinSubmit = () => {
    setPinError('')
    if (!profile?.pin) { setPinError('PIN não cadastrado. Contacte o administrador.'); return }
    if (pin !== profile.pin) { setPinError('PIN incorreto.'); return }
    setResult('granted')
    setPhase('result')
  }

  const handleScanComplete = () => {
    setResult('granted')
    setPhase('result')
  }

  if (securityLevel === 'low') return null

  const TitleIcon = securityLevel === 'medium' ? KeyRound
    : securityLevel === 'maximum' ? ShieldAlert : ScanFace

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 rounded-2xl border border-border bg-background shadow-2xl shadow-primary/20 overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border/40 flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <TitleIcon className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm uppercase tracking-widest text-primary">
                {titleMap[securityLevel]}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{routeLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => onClose()}
            className="text-muted-foreground hover:text-foreground transition-colors mt-0.5 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── PIN (média) ── */}
        {phase === 'pin' && (
          <div className="flex flex-col items-center gap-4 px-6 py-6">
            <KeyRound className="h-10 w-10 text-primary" />
            <p className="text-sm text-muted-foreground font-mono">Digite seu PIN de acesso</p>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="text-center text-2xl tracking-[0.5em] font-mono w-36"
              onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
              autoFocus
            />
            {pinError && <p className="text-sm text-destructive font-mono">{pinError}</p>}
            <div className="flex gap-2 w-full">
              <Button variant="outline" size="sm" className="font-mono" onClick={() => onClose()}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Voltar
              </Button>
              <Button className="flex-1 font-mono uppercase" onClick={handlePinSubmit} disabled={pin.length < 4}>
                Confirmar
              </Button>
            </div>
          </div>
        )}

        {/* ── SCAN (alta / máxima admin) ── */}
        {phase === 'scan' && <FacialScan onComplete={handleScanComplete} />}

        {/* ── RESULTADO ── */}
        {phase === 'result' && result && (
          <div className="flex flex-col items-center gap-4 px-6 py-6">
            {!imgError ? (
              <img
                src={result === 'granted' ? '/acesso-autorizado.png' : '/acesso-negado.png'}
                alt={result === 'granted' ? 'Autorizado' : 'Negado'}
                className="w-full rounded-lg"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className={`flex flex-col items-center gap-3 w-full py-6 rounded-lg ${
                result === 'granted' ? 'bg-green-950/40' : 'bg-red-950/40'
              }`}>
                {result === 'granted'
                  ? <CheckCircle2 className="h-16 w-16 text-green-400" />
                  : <XCircle className="h-16 w-16 text-destructive" />}
                <p className={`text-xl font-bold font-mono uppercase tracking-widest ${
                  result === 'granted' ? 'text-green-400' : 'text-destructive'
                }`}>
                  {result === 'granted' ? 'Acesso Autorizado' : 'Acesso Negado'}
                </p>
                {result === 'denied' && securityLevel === 'maximum' && (
                  <p className="text-xs text-destructive/70 font-mono">
                    Nível máximo — apenas administradores
                  </p>
                )}
              </div>
            )}
            {result === 'denied' && (
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1 font-mono" onClick={() => onClose()}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onClose()}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
