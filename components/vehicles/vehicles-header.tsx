'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

interface VehiclesHeaderProps {
  canManage: boolean
}

export function VehiclesHeader({ canManage }: VehiclesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Veiculos</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie a frota de veiculos das Industrias Wayne
        </p>
      </div>
      {canManage && (
        <Button asChild>
          <Link href="/dashboard/vehicles/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Veiculo
          </Link>
        </Button>
      )}
    </div>
  )
}
