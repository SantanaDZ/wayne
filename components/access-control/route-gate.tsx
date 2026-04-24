'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FacialScan } from './facial-scan'
import {
  KeyRound, ShieldAlert, ScanFace, CheckCircle2,
  XCircle, ArrowLeft, Loader2,
} from 'lucide-react'
import type { Profile } from '@/lib/types/database'
import type { SecurityLevel, RouteSecurity } from '@/app/dashboard/access-control/route-actions'

interface RouteGateProps {
  profile: Profile | null
  children: React.ReactNode
}

type GateState = 'checking' | 'open' | 'pin' | 'scan' | 'denied'

const STORAGE_PREFIX = 'wayne_route_ok_'

const titleMap: Record<SecurityLevel, string> = {
  low:     '',
  medium:  'Autenticação PIN',
  high:    'Scan Facial',
  maximum: 'Autorização Máxima',
}

const iconMap: Record<SecurityLevel, React.ElementType> = {
  low:     KeyRound,
  medium:  KeyRound,
  high:    ScanFace,
  maximum: ShieldAlert,
}

export function RouteGate({ profile, children }: RouteGateProps) {
  const pathname = usePathname()
  const router   = useRouter()

  const [state,    setState]    = useState<GateState>('checking')
  const [level,    setLevel]    = useState<SecurityLevel>('low')
  const [label,    setLabel]    = useState('')
  const [pin,      setPin]      = useState('')
  const [pinError, setPinError] = useState('')
  const [imgError, setImgError] = useState(false)

  // Verifica segurança a cada mudança de rota
  useEffect(() => {
    setState('checking')
    setPin('')
    setPinError('')
    setImgError(false)

    const base = pathname.split('?')[0].replace(/\/$/, '')

    if (sessionStorage.getItem(STORAGE_PREFIX + base)) {
      setState('open')
      return
    }

    const supabase = createClient()
    supabase
      .from('route_security')
      .select('*')
      .eq('route', base)
      .maybeSingle()
      .then(({ data }) => {
        const config = data as RouteSecurity | null

        if (!config || !config.security_level || config.security_level === 'low') {
          setState('open')
          return
        }

        const lvl = config.security_level as SecurityLevel
        setLevel(lvl)
        setLabel(config.label)

        if (lvl === 'maximum' && profile?.role !== 'admin') {
          setState('denied')
          return
        }

        if (lvl === 'medium') { setState('pin');  return }
        if (lvl === 'high' || lvl === 'maximum') { setState('scan'); return }

        setState('open')
      })
  }, [pathname, profile])

  const grant = useCallback(() => {
    const base = pathname.split('?')[0].replace(/\/$/, '')
    sessionStorage.setItem(STORAGE_PREFIX + base, '1')
    setState('open')
  }, [pathname])

  const handlePinSubmit = () => {
    setPinError('')
    if (!profile?.pin) { setPinError('PIN não cadastrado. Contacte o administrador.'); return }
    if (pin !== profile.pin) { setPinError('PIN incorreto.'); return }
    grant()
  }

  const handleScanComplete = () => {
    grant()
  }

  // Aberto → renderiza conteúdo normalmente
  if (state === 'open') return <>{children}</>

  const TitleIcon = iconMap[level] ?? ShieldAlert

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">

      {/* ── Verificando ── */}
      {state === 'checking' && (
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm font-mono">Verificando credenciais...</span>
        </div>
      )}

      {/* ── PIN ── */}
      {state === 'pin' && (
        <div className="w-full max-w-xs flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-1">
            <KeyRound className="h-10 w-10 text-primary mb-1" />
            <p className="font-mono text-base uppercase tracking-widest text-primary">{titleMap[level]}</p>
            <p className="text-xs text-muted-foreground font-mono">{label}</p>
          </div>
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
            <Button variant="outline" className="flex-1 font-mono" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
            <Button className="flex-1 font-mono uppercase" onClick={handlePinSubmit} disabled={pin.length < 4}>
              Confirmar
            </Button>
          </div>
        </div>
      )}

      {/* ── SCAN FACIAL ── */}
      {state === 'scan' && (
        <div className="w-full max-w-sm flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-1 mb-2">
            <ScanFace className="h-8 w-8 text-primary" />
            <p className="font-mono text-base uppercase tracking-widest text-primary">{titleMap[level]}</p>
            <p className="text-xs text-muted-foreground font-mono">{label}</p>
          </div>
          <div className="w-full rounded-xl overflow-hidden border border-border/40">
            <FacialScan onComplete={handleScanComplete} />
          </div>
          <Button variant="outline" className="w-full font-mono" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
        </div>
      )}

      {/* ── ACESSO NEGADO ── */}
      {state === 'denied' && (
        <div className="w-full max-w-xs flex flex-col items-center gap-5">
          {!imgError ? (
            <img
              src="/acesso-negado.png"
              alt="Acesso Negado"
              className="w-full rounded-xl"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 w-full py-10 rounded-xl bg-red-950/30 border border-destructive/20">
              <XCircle className="h-16 w-16 text-destructive" />
              <p className="text-xl font-bold font-mono uppercase tracking-widest text-destructive">
                Acesso Negado
              </p>
              {level === 'maximum' && (
                <p className="text-xs text-destructive/60 font-mono text-center">
                  Nível máximo — apenas administradores
                </p>
              )}
            </div>
          )}
          <Button variant="outline" className="w-full font-mono" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao Dashboard
          </Button>
        </div>
      )}

    </div>
  )
}
