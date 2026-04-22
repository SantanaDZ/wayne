'use client'

import { useCallback } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { Badge } from '@/components/ui/badge'
import { Wrench, Car, Shield, ImageOff } from 'lucide-react'
import { ItemsDrawer, type DrawerItem } from './items-drawer'
import { useState } from 'react'

interface DashboardCarouselProps {
  allItems: DrawerItem[]
}

const typeLabel = { equipment: 'Equipamento', vehicle: 'Veículo', security_device: 'Dispositivo' }
const typeIcon  = { equipment: Wrench, vehicle: Car, security_device: Shield }

const statusLabel: Record<string, string> = {
  available: 'Disponível', in_use: 'Em Uso', maintenance: 'Em Manutenção',
  retired: 'Aposentado', active: 'Ativo', inactive: 'Inativo',
}
const statusColor: Record<string, string> = {
  available:   'bg-chart-4/20 text-chart-4 border-chart-4/30',
  in_use:      'bg-chart-1/20 text-chart-1 border-chart-1/30',
  maintenance: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  retired:     'bg-muted text-muted-foreground border-border',
  active:      'bg-chart-4/20 text-chart-4 border-chart-4/30',
  inactive:    'bg-muted text-muted-foreground border-border',
}

export function DashboardCarousel({ allItems }: DashboardCarouselProps) {
  const [drawer, setDrawer] = useState<{ title: string; items: DrawerItem[] } | null>(null)

  const autoplay = useCallback(
    () => Autoplay({ delay: 2800, stopOnInteraction: false, stopOnMouseEnter: true }),
    []
  )

  const withImages = allItems.filter((i) => i.image_url)
  if (withImages.length === 0) return null

  const handleClick = (item: DrawerItem) => {
    const typeItems = allItems.filter((i) => i.type === item.type)
    setDrawer({ title: typeLabel[item.type], items: typeItems })
  }

  return (
    <>
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium pl-1">
          Inventário
        </p>

        <Carousel
          plugins={[autoplay()]}
          opts={{ loop: true, align: 'start' }}
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {withImages.map((item) => {
              const Icon = typeIcon[item.type]
              return (
                <CarouselItem
                  key={item.id}
                  className="pl-3 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                >
                  <button
                    type="button"
                    className="w-full text-left group rounded-xl overflow-hidden border border-border/40 bg-card/70 hover:border-border hover:bg-card transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => handleClick(item)}
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted/30">
                      <img
                        src={item.image_url!}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver todos
                      </span>
                    </div>
                    <div className="p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-xs font-medium truncate">{item.name}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] h-4 px-1.5 ${statusColor[item.status] ?? ''}`}
                      >
                        {statusLabel[item.status] ?? item.status}
                      </Badge>
                    </div>
                  </button>
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </Carousel>
      </div>

      <ItemsDrawer
        open={!!drawer}
        onOpenChange={(o) => { if (!o) setDrawer(null) }}
        title={drawer?.title ?? ''}
        items={drawer?.items ?? []}
      />
    </>
  )
}
