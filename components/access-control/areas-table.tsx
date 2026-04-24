'use client'

import { useState } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Fingerprint, Lock, AlertTriangle, KeyRound, ScanFace, ShieldAlert } from 'lucide-react'
import type { RestrictedArea, SecurityLevel, AreaStatus, Profile } from '@/lib/types/database'
import { AccessDialog } from './access-dialog'

interface AreasTableProps {
  areas: RestrictedArea[]
  canManage: boolean
  profile: Profile | null
}

const levelLabels: Record<SecurityLevel, string> = {
  low:     'Baixa',
  medium:  'Media',
  high:    'Alta',
  maximum: 'MAXIMA',
}

const levelColors: Record<SecurityLevel, string> = {
  low:     'bg-wayne-success/20 text-wayne-success border-wayne-success/30',
  medium:  'bg-wayne-info/20 text-wayne-info border-wayne-info/30',
  high:    'bg-wayne-warning/20 text-wayne-warning border-wayne-warning/30',
  maximum: 'bg-destructive/20 text-destructive border-destructive/30 animate-pulse',
}

const statusLabels: Record<AreaStatus, string> = {
  operational: 'Operacional',
  lockdown:    'LOCKDOWN',
  maintenance: 'Manutencao',
}

const accessButton: Record<SecurityLevel, { label: string; Icon: React.ElementType }> = {
  low:     { label: 'Verificar Acesso',   Icon: Fingerprint },
  medium:  { label: 'Autenticar PIN',     Icon: KeyRound    },
  high:    { label: 'Scan Facial',        Icon: ScanFace    },
  maximum: { label: 'Autorização Máxima', Icon: ShieldAlert },
}

export function AreasTable({ areas, canManage, profile }: AreasTableProps) {
  const [selectedArea, setSelectedArea] = useState<RestrictedArea | null>(null)

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Setor / Area Restrita</TableHead>
              <TableHead>Nivel de Seguranca</TableHead>
              <TableHead>Status Operacional</TableHead>
              <TableHead className="text-right">Acao de Acesso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {areas.length > 0 ? areas.map((area) => {
              const btn = accessButton[area.security_level]
              const blocked = area.status === 'lockdown' && !canManage
              return (
                <TableRow key={area.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded border border-border">
                        {area.security_level === 'maximum'
                          ? <AlertTriangle className="h-5 w-5 text-destructive" />
                          : <Lock className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <div>
                        <div className="font-bold text-foreground font-mono">{area.name}</div>
                        <div className="text-sm text-muted-foreground">{area.description}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className={levelColors[area.security_level]}>
                      Nivel: {levelLabels[area.security_level]}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        area.status === 'operational' ? 'bg-wayne-success' :
                        area.status === 'lockdown'    ? 'bg-destructive animate-ping' :
                        'bg-wayne-warning'
                      }`} />
                      <span className={area.status === 'lockdown' ? 'text-destructive font-bold' : 'text-muted-foreground'}>
                        {statusLabels[area.status]}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-2 ${blocked
                        ? 'opacity-50 cursor-not-allowed'
                        : 'border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground'}`}
                      disabled={blocked}
                      onClick={() => { if (!blocked) setSelectedArea(area) }}
                    >
                      <btn.Icon className="h-4 w-4" />
                      {btn.label}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            }) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground font-mono">
                  SISTEMA OFFLINE. NENHUMA AREA CARREGADA.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AccessDialog
        area={selectedArea}
        open={!!selectedArea}
        onOpenChange={(o) => { if (!o) setSelectedArea(null) }}
        profile={profile}
      />
    </div>
  )
}
