import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MapPin } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { Location } from '@/lib/types/database'

export const metadata = { title: 'Locais' }

async function getLocationsData() {
  const supabase = await createClient()

  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .order('name')

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, name, image_url, status, location_id')

  const { data: equipment } = await supabase
    .from('equipment')
    .select('id, name, image_url, status, location_id')

  return { locations: locations ?? [], vehicles: vehicles ?? [], equipment: equipment ?? [] }
}

const statusLabel: Record<string, string> = {
  available: 'Disponível', in_use: 'Em Uso', maintenance: 'Em Manutenção',
  retired: 'Aposentado', active: 'Ativo', inactive: 'Inativo',
}
const statusColor: Record<string, string> = {
  available:   'bg-chart-4/20 text-chart-4 border-chart-4/30',
  in_use:      'bg-chart-1/20 text-chart-1 border-chart-1/30',
  maintenance: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  retired:     'bg-muted/60 text-muted-foreground border-border',
}

export default async function LocationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { locations, vehicles, equipment } = await getLocationsData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Locais</h1>
        <p className="text-muted-foreground mt-1">Distribuição de recursos por localidade</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {locations.map((loc: Location) => {
          const locVehicles  = vehicles.filter((v) => v.location_id === loc.id)
          const locEquipment = equipment.filter((e) => e.location_id === loc.id)
          const items = [
            ...locVehicles.map((v) => ({ ...v, type: 'vehicle' as const })),
            ...locEquipment.map((e) => ({ ...e, type: 'equipment' as const })),
          ]

          return (
            <Card key={loc.id} className="border-border/50 overflow-hidden flex flex-col">
              {/* Imagem do local */}
              <div className="relative w-full aspect-video bg-muted/30 overflow-hidden">
                {loc.image_url ? (
                  <img
                    src={loc.image_url}
                    alt={loc.name}
                    className="w-full h-full object-cover scale-[1.04]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <MapPin className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
                  <p className="text-white text-lg font-bold">{loc.name}</p>
                  {loc.description && (
                    <p className="text-white/60 text-xs mt-0.5">{loc.description}</p>
                  )}
                </div>
                <Badge variant="secondary" className="absolute top-3 right-3 text-xs">
                  {items.length} {items.length === 1 ? 'item' : 'itens'}
                </Badge>
              </div>

              {/* Lista de itens */}
              <div className="flex-1 p-4">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground/50 text-center py-4">
                    Nenhum item neste local
                  </p>
                ) : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border/30 bg-muted/20 p-2">
                        <div className="shrink-0 w-10 h-10 rounded-md overflow-hidden bg-muted/40">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                              <MapPin className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {item.type === 'vehicle' ? 'Veículo' : 'Equipamento'}
                          </p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${statusColor[item.status] ?? ''}`}>
                          {statusLabel[item.status] ?? item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
