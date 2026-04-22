'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Building2, MapPin, LayoutGrid, Pencil, Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { deleteDepartmentAction, deleteLocationAction, deleteSectorAction } from '@/app/dashboard/departments/actions'
import { DepartmentDialog } from './department-dialog'
import { LocationDialog } from './location-dialog'
import { SectorDialog } from './sector-dialog'
import type { Department, DepartmentLocation, DepartmentSector } from '@/lib/types/database'

interface DepartmentCardProps {
  department: Department
}

export function DepartmentCard({ department }: DepartmentCardProps) {
  const [editDeptOpen, setEditDeptOpen] = useState(false)
  const [deleteDeptOpen, setDeleteDeptOpen] = useState(false)
  const [newLocOpen, setNewLocOpen] = useState(false)

  const [editLocation, setEditLocation] = useState<DepartmentLocation | undefined>()
  const [deleteLocationId, setDeleteLocationId] = useState<string | null>(null)
  const [newSectorForLocation, setNewSectorForLocation] = useState<DepartmentLocation | undefined>()

  const [editSector, setEditSector] = useState<{ sector: DepartmentSector; locationId: string; locationName: string } | undefined>()
  const [deleteSectorId, setDeleteSectorId] = useState<string | null>(null)

  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set())

  const toggleLocation = (id: string) => {
    setExpandedLocations(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleDeleteDepartment = async () => {
    const result = await deleteDepartmentAction(department.id)
    if (result?.error) toast.error(result.error)
    else toast.success('Departamento excluído.')
  }

  const handleDeleteLocation = async () => {
    if (!deleteLocationId) return
    const result = await deleteLocationAction(deleteLocationId)
    if (result?.error) toast.error(result.error)
    else toast.success('Local excluído.')
    setDeleteLocationId(null)
  }

  const handleDeleteSector = async () => {
    if (!deleteSectorId) return
    const result = await deleteSectorAction(deleteSectorId)
    if (result?.error) toast.error(result.error)
    else toast.success('Setor excluído.')
    setDeleteSectorId(null)
  }

  const locations = department.locations ?? []

  return (
    <>
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-lg leading-tight truncate">{department.name}</h3>
                {department.description && (
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{department.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditDeptOpen(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteDeptOpen(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {locations.length} {locations.length === 1 ? 'local' : 'locais'}
            </Badge>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setNewLocOpen(true)}>
              <Plus className="h-3 w-3" />
              Novo local
            </Button>
          </div>
        </CardHeader>

        {locations.length > 0 && (
          <CardContent className="pt-0 space-y-2">
            {locations.map((loc) => {
              const isExpanded = expandedLocations.has(loc.id)
              const sectors = loc.sectors ?? []
              return (
                <div key={loc.id} className="rounded-md border border-border/40 bg-background/40">
                  <div className="flex items-center justify-between px-3 py-2">
                    <button
                      type="button"
                      className="flex items-center gap-2 text-sm font-medium flex-1 text-left hover:text-primary transition-colors"
                      onClick={() => toggleLocation(loc.id)}
                    >
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {loc.name}
                      <Badge variant="outline" className="text-xs ml-1">
                        {sectors.length} {sectors.length === 1 ? 'setor' : 'setores'}
                      </Badge>
                    </button>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setNewSectorForLocation(loc)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditLocation(loc)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => setDeleteLocationId(loc.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-3 pb-2 space-y-1">
                      {sectors.length === 0 && (
                        <p className="text-xs text-muted-foreground pl-6 py-1">Nenhum setor cadastrado.</p>
                      )}
                      {sectors.map((sector) => (
                        <div key={sector.id} className="flex items-center justify-between pl-6">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <LayoutGrid className="h-3 w-3" />
                            {sector.name}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="icon" variant="ghost" className="h-5 w-5"
                              onClick={() => setEditSector({ sector, locationId: loc.id, locationName: loc.name })}
                            >
                              <Pencil className="h-2.5 w-2.5" />
                            </Button>
                            <Button
                              size="icon" variant="ghost" className="h-5 w-5 text-destructive hover:text-destructive"
                              onClick={() => setDeleteSectorId(sector.id)}
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        )}
      </Card>

      {/* Dialogs — Department */}
      <DepartmentDialog open={editDeptOpen} onOpenChange={setEditDeptOpen} department={department} />

      <AlertDialog open={deleteDeptOpen} onOpenChange={setDeleteDeptOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir departamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá <strong>{department.name}</strong> e todos os seus locais e setores. Não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDepartment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogs — Location */}
      <LocationDialog
        open={newLocOpen}
        onOpenChange={setNewLocOpen}
        departmentId={department.id}
        departmentName={department.name}
      />
      {editLocation && (
        <LocationDialog
          open={!!editLocation}
          onOpenChange={(o) => { if (!o) setEditLocation(undefined) }}
          departmentId={department.id}
          departmentName={department.name}
          location={editLocation}
        />
      )}
      <AlertDialog open={!!deleteLocationId} onOpenChange={(o) => { if (!o) setDeleteLocationId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir local?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os setores deste local serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLocation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogs — Sector */}
      {newSectorForLocation && (
        <SectorDialog
          open={!!newSectorForLocation}
          onOpenChange={(o) => { if (!o) setNewSectorForLocation(undefined) }}
          locationId={newSectorForLocation.id}
          locationName={newSectorForLocation.name}
        />
      )}
      {editSector && (
        <SectorDialog
          open={!!editSector}
          onOpenChange={(o) => { if (!o) setEditSector(undefined) }}
          locationId={editSector.locationId}
          locationName={editSector.locationName}
          sector={editSector.sector}
        />
      )}
      <AlertDialog open={!!deleteSectorId} onOpenChange={(o) => { if (!o) setDeleteSectorId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir setor?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSector} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
