'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Building2 } from 'lucide-react'
import { DepartmentCard } from './department-card'
import { DepartmentDialog } from './department-dialog'
import type { Department } from '@/lib/types/database'

interface DepartmentsListProps {
  departments: Department[]
}

export function DepartmentsList({ departments }: DepartmentsListProps) {
  const [newDeptOpen, setNewDeptOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Departamentos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie a estrutura organizacional: departamentos, locais e setores
          </p>
        </div>
        <Button onClick={() => setNewDeptOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Departamento
        </Button>
      </div>

      {departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground font-medium">Nenhum departamento cadastrado.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Crie o primeiro departamento para organizar sua estrutura.
          </p>
          <Button onClick={() => setNewDeptOpen(true)} className="mt-4 gap-2" variant="outline">
            <Plus className="h-4 w-4" />
            Criar departamento
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {departments.map((dept) => (
            <DepartmentCard key={dept.id} department={dept} />
          ))}
        </div>
      )}

      <DepartmentDialog open={newDeptOpen} onOpenChange={setNewDeptOpen} />
    </div>
  )
}
