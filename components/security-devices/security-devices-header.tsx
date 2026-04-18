'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

interface SecurityDevicesHeaderProps {
  canManage: boolean
}

export function SecurityDevicesHeader({ canManage }: SecurityDevicesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dispositivos de Seguranca</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie cameras, sensores e biometria das Indústrias Wayne
        </p>
      </div>
      
      {canManage && (
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/dashboard/security-devices/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Dispositivo
          </Link>
        </Button>
      )}
    </div>
  )
}
