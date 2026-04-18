'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Grid2X2, List, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'

type ViewMode = 'showcase' | 'list'

interface ResourceDisplayProps<T> {
  items: T[]
  getItemKey: (item: T) => string
  getItemTitle: (item: T) => string
  getItemEyebrow?: (item: T, index: number) => string
  getItemSummary?: (item: T) => string | null | undefined
  renderHero: (item: T) => ReactNode
  renderTable: ReactNode
  emptyState: ReactNode
}

export function ResourceDisplay<T>({
  items,
  getItemKey,
  getItemTitle,
  getItemEyebrow,
  getItemSummary,
  renderHero,
  renderTable,
  emptyState,
}: ResourceDisplayProps<T>) {
  const [viewMode, setViewMode] = useState<ViewMode>('showcase')
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!carouselApi) return

    const updateSelection = () => {
      setSelectedIndex(carouselApi.selectedScrollSnap())
    }

    updateSelection()
    carouselApi.on('select', updateSelection)
    carouselApi.on('reInit', updateSelection)

    return () => {
      carouselApi.off('select', updateSelection)
      carouselApi.off('reInit', updateSelection)
    }
  }, [carouselApi])

  useEffect(() => {
    if (!items.length) {
      setSelectedIndex(0)
      return
    }

    if (selectedIndex > items.length - 1) {
      setSelectedIndex(items.length - 1)
      carouselApi?.scrollTo(items.length - 1)
    }
  }, [carouselApi, items.length, selectedIndex])

  if (!items.length) {
    return <>{emptyState}</>
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(14,18,25,0.92),rgba(7,10,15,0.96))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-primary/70">
              <Sparkles className="h-3.5 w-3.5" />
              Modo de exibicao
            </p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">
              Alterne entre vitrine em destaque e lista operacional
            </h3>
          </div>

          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => {
              if (value === 'showcase' || value === 'list') {
                setViewMode(value)
              }
            }}
            variant="outline"
            className="border border-white/10 bg-background/60"
          >
            <ToggleGroupItem value="showcase" className="gap-2 px-4">
              <Grid2X2 className="h-4 w-4" />
              Showcase
            </ToggleGroupItem>
            <ToggleGroupItem value="list" className="gap-2 px-4">
              <List className="h-4 w-4" />
              Lista
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <p className="text-sm text-muted-foreground">
          O modo showcase destaca cada item em tela grande; a lista preserva a leitura rapida em formato tabular.
        </p>
      </div>

      <div className={cn(viewMode === 'showcase' ? 'block' : 'hidden')}>
        <div className="space-y-4">
          <div className="relative rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(31,79,143,0.24),transparent_38%),linear-gradient(180deg,rgba(10,14,20,0.98),rgba(8,10,14,0.98))] p-4 sm:p-6 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
            <Carousel
              setApi={setCarouselApi}
              opts={{
                align: 'start',
                loop: items.length > 1,
              }}
              className="mx-auto w-full max-w-6xl"
            >
              <CarouselContent>
                {items.map((item) => (
                  <CarouselItem key={getItemKey(item)}>
                    {renderHero(item)}
                  </CarouselItem>
                ))}
              </CarouselContent>
              {items.length > 1 ? (
                <>
                  <CarouselPrevious className="left-2 top-auto bottom-2 h-11 w-11 border-white/15 bg-background/80 text-foreground hover:bg-background" />
                  <CarouselNext className="right-2 top-auto bottom-2 h-11 w-11 border-white/15 bg-background/80 text-foreground hover:bg-background" />
                </>
              ) : null}
            </Carousel>
          </div>

          {items.length > 1 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {items.map((item, index) => {
                const isActive = index === selectedIndex

                return (
                  <Card
                    key={getItemKey(item)}
                    className={cn(
                      'overflow-hidden border-white/10 bg-[linear-gradient(135deg,rgba(17,24,32,0.94),rgba(11,15,21,0.98))] py-0 transition-all duration-300',
                      isActive
                        ? 'translate-y-[-2px] border-primary/40 shadow-[0_18px_50px_rgba(31,79,143,0.24)]'
                        : 'opacity-80 hover:opacity-100'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => carouselApi?.scrollTo(index)}
                      className="flex w-full flex-col items-start gap-3 p-4 text-left"
                    >
                      <div className="flex w-full items-center justify-between gap-3">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-primary/70">
                          {getItemEyebrow?.(item, index) ?? `Item ${index + 1}`}
                        </span>
                        <span
                          className={cn(
                            'h-2.5 w-2.5 rounded-full border border-white/20',
                            isActive ? 'bg-primary shadow-[0_0_18px_rgba(31,79,143,0.8)]' : 'bg-white/15'
                          )}
                        />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-foreground">
                          {getItemTitle(item)}
                        </h4>
                        {getItemSummary?.(item) ? (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {getItemSummary(item)}
                          </p>
                        ) : null}
                      </div>
                    </button>
                  </Card>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>

      <div className={cn(viewMode === 'list' ? 'block' : 'hidden')}>
        {renderTable}
      </div>

      {viewMode === 'showcase' ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setViewMode('list')}>
            Abrir em lista
          </Button>
        </div>
      ) : null}
    </div>
  )
}
