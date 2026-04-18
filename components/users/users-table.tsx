'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  ShieldCheck,
  ShieldAlert,
  User,
  Building2,
  CalendarDays,
  Loader2,
} from 'lucide-react'
import type { Profile } from '@/lib/types/database'
import { EditUserDialog } from './edit-user-dialog'
import { deleteUserAction } from '@/app/dashboard/users/actions'

interface UsersTableProps {
  users: Profile[]
  currentUserId: string
  canManage: boolean
  isAdmin: boolean
}

const roleConfig = {
  admin: {
    label: 'Administrador',
    className: 'bg-primary/20 text-primary border-primary/40',
    icon: ShieldCheck,
  },
  manager: {
    label: 'Gerente',
    className: 'bg-wayne-info/20 text-wayne-info border-wayne-info/40',
    icon: ShieldAlert,
  },
  employee: {
    label: 'Funcionário',
    className: 'bg-muted text-muted-foreground border-border',
    icon: User,
  },
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function UsersTable({ users, currentUserId, canManage, isAdmin }: UsersTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [deletingUser, setDeletingUser] = useState<Profile | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (u.department ?? '').toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async () => {
    if (!deletingUser) return
    setDeleteLoading(true)
    await deleteUserAction(deletingUser.id)
    setDeleteLoading(false)
    setDeletingUser(null)
    router.refresh()
  }

  return (
    <>
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="user-search"
          placeholder="Buscar por nome, departamento ou cargo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-input border-border"
        />
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {(['admin', 'manager', 'employee'] as const).map((role) => {
          const count = users.filter((u) => u.role === role).length
          const cfg = roleConfig[role]
          const Icon = cfg.icon
          return (
            <div
              key={role}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/60"
            >
              <div className={`p-2 rounded-md border ${cfg.className}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-foreground">{count}</div>
                <div className="text-xs text-muted-foreground">{cfg.label}{count !== 1 ? 's' : ''}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="w-[300px]">Operativo</TableHead>
              <TableHead>Nível de Acesso</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Registrado em</TableHead>
              {canManage && <TableHead className="text-right w-[60px]">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((user) => {
                const cfg = roleConfig[user.role]
                const RoleIcon = cfg.icon
                const isSelf = user.id === currentUserId

                return (
                  <TableRow
                    key={user.id}
                    className="hover:bg-muted/40 transition-colors border-border"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {getInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            {user.full_name}
                            {isSelf && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/40 text-primary">
                                você
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {user.id.slice(0, 8)}…
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`gap-1.5 ${cfg.className}`}
                      >
                        <RoleIcon className="h-3 w-3" />
                        {cfg.label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                        {user.department ? (
                          <>
                            <Building2 className="h-3.5 w-3.5 shrink-0" />
                            {user.department}
                          </>
                        ) : (
                          <span className="italic opacity-40">—</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                        {formatDate(user.created_at)}
                      </div>
                    </TableCell>

                    {canManage && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              id={`user-actions-${user.id}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuLabel className="text-muted-foreground text-xs">
                              Ações do Operativo
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                              onClick={() => setEditingUser(user)}
                              className="cursor-pointer gap-2"
                            >
                              <Pencil className="h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            {isAdmin && !isSelf && (
                              <DropdownMenuItem
                                onClick={() => setDeletingUser(user)}
                                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={canManage ? 5 : 4}
                  className="h-32 text-center text-muted-foreground font-mono"
                >
                  {search
                    ? 'NENHUM OPERATIVO ENCONTRADO COM ESSE FILTRO.'
                    : 'SISTEMA OFFLINE. NENHUM OPERATIVO CARREGADO.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit dialog */}
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Excluir Operativo
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir{' '}
              <span className="font-semibold text-foreground">{deletingUser?.full_name}</span>?
              Esta ação é irreversível e removerá todos os dados deste colaborador do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border" disabled={deleteLoading}>Cancelar</AlertDialogCancel>
            <Button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              id="confirm-delete-user"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Sim, excluir'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
