'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RouteChallenge } from './route-challenge'
import type { Profile } from '@/lib/types/database'
import type { SecurityLevel, RouteSecurity } from '@/app/dashboard/access-control/route-actions'

interface RouteGuardProps {
  profile: Profile | null
}

const STORAGE_PREFIX = 'wayne_route_ok_'

export function RouteGuard({ profile }: RouteGuardProps) {
  const pathname = usePathname()
  const [challenge, setChallenge] = useState<{ level: SecurityLevel; label: string } | null>(null)

  const handleGranted = useCallback(() => {
    const base = pathname.split('?')[0].replace(/\/$/, '')
    sessionStorage.setItem(STORAGE_PREFIX + base, '1')
    setChallenge(null)
  }, [pathname])

  const handleClose = useCallback(() => {
    setChallenge(null)
  }, [])

  // Limpa o challenge e verifica a nova rota a cada mudança de pathname
  useEffect(() => {
    setChallenge(null)

    const base = pathname.split('?')[0].replace(/\/$/, '')
    if (sessionStorage.getItem(STORAGE_PREFIX + base)) return

    const supabase = createClient()
    supabase
      .from('route_security')
      .select('*')
      .eq('route', base)
      .maybeSingle()
      .then(({ data }) => {
        const config = data as RouteSecurity | null
        if (!config || !config.security_level) return
        const level = config.security_level as SecurityLevel
        if (level === 'low') return
        setChallenge({ level, label: config.label })
      })
  }, [pathname])

  if (!challenge) return null

  return (
    <RouteChallenge
      securityLevel={challenge.level}
      routeLabel={challenge.label}
      profile={profile}
      onGranted={handleGranted}
      onClose={handleClose}
    />
  )
}
