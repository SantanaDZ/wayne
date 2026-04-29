'use client'

import { useEffect, useState } from 'react'
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface WeatherData {
  temp: number
  code: number
  wind: number
}

function weatherInfo(code: number): { label: string; Icon: React.ElementType; color: string } {
  if (code === 0)               return { label: 'Céu limpo',        Icon: Sun,        color: 'text-yellow-400' }
  if (code <= 3)                return { label: 'Parcialmente nublado', Icon: Cloud,  color: 'text-sky-300'   }
  if (code <= 48)               return { label: 'Neblina',          Icon: Cloud,      color: 'text-slate-400' }
  if (code <= 67)               return { label: 'Chuva',            Icon: CloudRain,  color: 'text-blue-400'  }
  if (code <= 77)               return { label: 'Neve',             Icon: CloudSnow,  color: 'text-slate-200' }
  if (code <= 82)               return { label: 'Pancadas',         Icon: CloudRain,  color: 'text-blue-500'  }
  return                               { label: 'Tempestade',       Icon: CloudRain,  color: 'text-violet-400' }
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Open-Meteo — gratuito, sem API key (coordenadas: São Paulo)
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=-23.5505&longitude=-46.6333&current=temperature_2m,weather_code,wind_speed_10m&timezone=America%2FSao_Paulo'
    )
      .then(r => r.json())
      .then(d => {
        setWeather({
          temp: Math.round(d.current.temperature_2m),
          code: d.current.weather_code,
          wind: Math.round(d.current.wind_speed_10m),
        })
      })
      .catch(() => setWeather(null))
      .finally(() => setLoading(false))
  }, [])

  const info = weather ? weatherInfo(weather.code) : null

  return (
    <Card className="border-border/50 bg-card/80 h-full">
      <CardContent className="pt-5 flex flex-col justify-between h-full min-h-[130px]">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono mb-3">Clima · Gotham</p>

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        )}

        {!loading && !weather && (
          <p className="text-sm text-muted-foreground">Indisponível</p>
        )}

        {!loading && weather && info && (
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-bold text-foreground leading-none">{weather.temp}</span>
                <span className="text-xl text-muted-foreground mb-1">°C</span>
              </div>
              <p className={`text-sm font-medium mt-1 ${info.color}`}>{info.label}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <info.Icon className={`h-10 w-10 ${info.color}`} />
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Wind className="h-3 w-3" /> {weather.wind} km/h
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
