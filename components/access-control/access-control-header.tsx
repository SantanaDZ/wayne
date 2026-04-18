'use client'

import { Button } from '@/components/ui/button'
import { ShieldAlert, Plus } from 'lucide-react'
import Link from 'next/link'

interface AccessControlHeaderProps {
  canManage: boolean
}

export function AccessControlHeader({ canManage }: AccessControlHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-wayne-warning" />
          Controle de Acesso Sensível
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerenciamento de credenciais e biometria para instalações restritas das Indústrias Wayne.
        </p>
      </div>
      {canManage && (
        <Button asChild>
          <Link href="/dashboard/access-control/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Área Restrita
          </Link>
        </Button>
      )}
    </div>
  )
}
