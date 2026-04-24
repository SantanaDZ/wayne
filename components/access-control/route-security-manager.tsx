'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Loader2, Route } from 'lucide-react'
import { toast } from 'sonner'
import { setRouteSecurityAction } from '@/app/dashboard/access-control/route-actions'
import type { RouteSecurity, SecurityLevel } from '@/app/dashboard/access-control/route-actions'

const SYSTEM_ROUTES: { route: string; label: string }[] = [
  { route: '/dashboard/equipment',        label: 'Equipamentos'           },
  { route: '/dashboard/vehicles',         label: 'Veículos'               },
  { route: '/dashboard/security-devices', label: 'Dispositivos de Segurança' },
  { route: '/dashboard/locations',        label: 'Locais'                 },
  { route: '/dashboard/access-control',   label: 'Controle de Acesso'     },
  { route: '/dashboard/users',            label: 'Usuários'               },
  { route: '/dashboard/activity-logs',    label: 'Logs de Atividade'      },
]

const levelLabels: Record<string, string> = {
  low:     'Baixa',
  medium:  'Média',
  high:    'Alta',
  maximum: 'Máxima',
}
const levelColors: Record<string, string> = {
  low:     'bg-chart-4/20 text-chart-4 border-chart-4/30',
  medium:  'bg-blue-500/20 text-blue-400 border-blue-400/30',
  high:    'bg-chart-3/20 text-chart-3 border-chart-3/30',
  maximum: 'bg-destructive/20 text-destructive border-destructive/30',
}

interface RouteSecurityManagerProps {
  initialConfig: RouteSecurity[]
}

export function RouteSecurityManager({ initialConfig }: RouteSecurityManagerProps) {
  const initMap: Record<string, SecurityLevel> = {}
  for (const r of initialConfig) initMap[r.route] = r.security_level ?? 'low'

  const [levels, setLevels] = useState<Record<string, SecurityLevel>>(initMap)
  const [saving, setSaving] = useState<string | null>(null)

  const handleSave = async (route: string, label: string) => {
    setSaving(route)
    const level = (levels[route] ?? 'low') as SecurityLevel
    const result = await setRouteSecurityAction(route, label, level)
    setSaving(null)
    if (result?.error) toast.error(result.error)
    else toast.success(`Segurança de "${label}" atualizada.`)
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Route className="h-4 w-4 text-primary" />
          Segurança por Rota
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Defina o nível de autenticação exigido para acessar cada seção do sistema.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {SYSTEM_ROUTES.map(({ route, label }) => {
            const current = levels[route] ?? 'low'
            return (
              <div key={route} className="flex items-center justify-between gap-3 py-2 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium truncate">{label}</span>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${levelColors[current]}`}>
                    {levelLabels[current]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select
                    value={current}
                    onValueChange={(v) => setLevels((prev) => ({ ...prev, [route]: v as SecurityLevel }))}
                  >
                    <SelectTrigger className="h-8 w-36 text-xs">
                      <SelectValue placeholder="Sem proteção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média — PIN</SelectItem>
                      <SelectItem value="high">Alta — Scan Facial</SelectItem>
                      <SelectItem value="maximum">Máxima — Admin + Scan</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => handleSave(route, label)}
                    disabled={saving === route}
                  >
                    {saving === route && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                    Salvar
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
