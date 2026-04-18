'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

interface EquipmentHeaderProps {
  canManage: boolean
}

export function EquipmentHeader({ canManage }: EquipmentHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Equipamentos</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os equipamentos das Industrias Wayne
        </p>
      </div>
      {canManage && (
        <Button asChild>
          <Link href="/dashboard/equipment/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Equipamento
          </Link>
        </Button>
      )}
    </div>
  )
}
