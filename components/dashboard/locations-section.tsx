import Link from 'next/link'
import { MapPin, Car, Wrench, ArrowRight } from 'lucide-react'

interface LocationStat {
  id: string
  name: string
  description: string | null
  image_url: string | null
  vehicles: number
  equipment: number
}

interface DashboardLocationsSectionProps {
  locations: LocationStat[]
}

export function DashboardLocationsSection({ locations }: DashboardLocationsSectionProps) {
  if (locations.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">Locais</h2>
        </div>
        <Link
          href="/dashboard/locations"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {locations.map((loc) => {
          const total = loc.vehicles + loc.equipment
          return (
            <Link
              key={loc.id}
              href="/dashboard/locations"
              className="group relative overflow-hidden rounded-xl aspect-[4/3] block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* Imagem de fundo */}
              {loc.image_url ? (
                <img
                  src={loc.image_url}
                  alt={loc.name}
                  className="absolute inset-0 w-full h-full object-cover scale-[1.06] group-hover:scale-[1.12] transition-transform duration-700"
                />
              ) : (
                <div className="absolute inset-0 bg-muted/40 flex items-center justify-center">
                  <MapPin className="h-10 w-10 text-muted-foreground/30" />
                </div>
              )}

              {/* Gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Brilho sutil no hover */}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500" />

              {/* Conteúdo */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-bold text-lg leading-tight tracking-wide">
                  {loc.name}
                </p>
                {loc.description && (
                  <p className="text-white/50 text-xs mt-0.5 truncate">{loc.description}</p>
                )}

                <div className="flex items-center gap-3 mt-2">
                  {loc.vehicles > 0 && (
                    <span className="flex items-center gap-1 text-white/70 text-xs">
                      <Car className="h-3 w-3" />
                      {loc.vehicles}
                    </span>
                  )}
                  {loc.equipment > 0 && (
                    <span className="flex items-center gap-1 text-white/70 text-xs">
                      <Wrench className="h-3 w-3" />
                      {loc.equipment}
                    </span>
                  )}
                  {total === 0 && (
                    <span className="text-white/40 text-xs">Sem itens alocados</span>
                  )}
                </div>
              </div>

              {/* Badge de total */}
              {total > 0 && (
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white/80 text-xs font-mono px-2 py-0.5 rounded-full">
                  {total} {total === 1 ? 'item' : 'itens'}
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
