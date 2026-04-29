'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

export function MiniCalendar() {
  const today = new Date()
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() })

  const firstDay  = new Date(view.year, view.month, 1).getDay()
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()

  const prev = () => setView(v => {
    const d = new Date(v.year, v.month - 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const next = () => setView(v => {
    const d = new Date(v.year, v.month + 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const isToday = (day: number) =>
    day === today.getDate() &&
    view.month === today.getMonth() &&
    view.year === today.getFullYear()

  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  )

  return (
    <Card className="border-border/50 bg-card/80 h-full">
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={prev}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            {MONTHS[view.month]} {view.year}
          </p>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={next}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 text-center">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-[10px] text-muted-foreground/60 font-medium py-1">{d}</div>
          ))}
          {cells.map((day, i) => (
            <div
              key={i}
              className={`text-xs py-1 rounded-md text-center transition-colors ${
                !day ? '' :
                isToday(day)
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'text-foreground hover:bg-muted cursor-default'
              }`}
            >
              {day ?? ''}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
