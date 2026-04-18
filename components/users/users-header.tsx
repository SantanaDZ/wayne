'use client'

import { Button } from '@/components/ui/button'
import { Users, UserPlus } from 'lucide-react'
import { CreateUserDialog } from './create-user-dialog'
import { useState } from 'react'

interface UsersHeaderProps {
  canManage: boolean
  totalUsers: number
}

export function UsersHeader({ canManage, totalUsers }: UsersHeaderProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Users className="h-7 w-7 text-primary" />
            </div>
            Administração de Usuários
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os operativos e colaboradores das Indústrias Wayne.{' '}
            <span className="font-mono text-primary/70">{totalUsers} agente{totalUsers !== 1 ? 's' : ''} registrado{totalUsers !== 1 ? 's' : ''}.</span>
          </p>
        </div>
        {canManage && (
          <Button
            id="create-user-btn"
            className="gap-2 shrink-0"
            onClick={() => setOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            Novo Usuário
          </Button>
        )}
      </div>

      <CreateUserDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
