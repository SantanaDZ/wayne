'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Badge } from '@/components/ui/badge'
import { Wrench, Car, Shield, ImageOff } from 'lucide-react'

export interface DrawerItem {
  id: string
  name: string
  description: string | null
  status: string
  image_url: string | null
  type: 'equipment' | 'vehicle' | 'security_device'
}

interface ItemsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  items: DrawerItem[]
}

const statusLabel: Record<string, string> = {
  available: 'Disponível',
  in_use: 'Em Uso',
  maintenance: 'Em Manutenção',
  retired: 'Aposentado',
  active: 'Ativo',
  inactive: 'Inativo',
}

const statusColor: Record<string, string> = {
  available: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  in_use: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
  maintenance: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  retired: 'bg-muted text-muted-foreground border-border',
  active: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  inactive: 'bg-muted text-muted-foreground border-border',
}

const typeIcon = {
  equipment: Wrench,
  vehicle: Car,
  security_device: Shield,
}

export function ItemsDrawer({ open, onOpenChange, title, items }: ItemsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] flex flex-col">
        <SheetHeader className="shrink-0">
          <SheetTitle className="text-lg">{title}</SheetTitle>
          <p className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? 'item' : 'itens'}</p>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Nenhum item nesta categoria.
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center px-12 overflow-hidden">
            <Carousel
              opts={{ align: 'center', loop: items.length > 1 }}
              className="w-full max-w-4xl"
            >
              <CarouselContent className="-ml-4">
                {items.map((item) => {
                  const Icon = typeIcon[item.type]
                  return (
                    <CarouselItem key={item.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                      <div className="flex flex-col rounded-xl border border-border/50 bg-card/80 overflow-hidden h-64">
                        <div className="flex-1 relative bg-muted/30 flex items-center justify-center overflow-hidden">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                              <ImageOff className="h-10 w-10" />
                              <span className="text-xs">Sem imagem</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3 shrink-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <p className="font-medium text-sm truncate">{item.name}</p>
                              </div>
                              {item.description && (
                                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                              )}
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs shrink-0 ${statusColor[item.status] ?? ''}`}
                            >
                              {statusLabel[item.status] ?? item.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
              {items.length > 1 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
