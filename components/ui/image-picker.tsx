'use client'

import { useState } from 'react'
import { Input } from './input'
import { Label } from './label'
import { ImageOff, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImagePickerProps {
  value: string
  onChange: (value: string) => void
  presets?: string[]
  label?: string
  error?: string
}

export function ImagePicker({ value, onChange, presets = [], label = 'Imagem', error }: ImagePickerProps) {
  const [imgError, setImgError] = useState(false)

  const handleInput = (v: string) => {
    setImgError(false)
    onChange(v)
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      {/* Presets */}
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presets.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => handleInput(src)}
              className={cn(
                'relative w-16 h-16 rounded-md overflow-hidden border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                value === src ? 'border-primary' : 'border-border/50 hover:border-border'
              )}
            >
              <img src={src} alt={src} className="w-full h-full object-cover" />
              {value === src && (
                <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white drop-shadow" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Input + preview */}
      <div className="flex gap-2 items-start">
        <Input
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="/veiculos/heli.png"
          className="flex-1"
        />
        <div className="shrink-0 w-10 h-10 rounded-md overflow-hidden border border-border/50 bg-muted/40 flex items-center justify-center">
          {value && !imgError ? (
            <img
              src={value}
              alt="preview"
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <ImageOff className="h-4 w-4 text-muted-foreground/40" />
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
