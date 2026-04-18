import { describe, it, expect } from 'vitest'
import {
  equipmentSchema,
  vehicleSchema,
  securityDeviceSchema,
  extractFieldErrors,
} from '@/lib/validations'

// ── equipmentSchema ──────────────────────────────────────────────────────────

describe('equipmentSchema', () => {
  const valid = {
    name: 'Drone WayneTech',
    category: 'tech',
    status: 'available',
  }

  it('aceita dados válidos mínimos', () => {
    expect(equipmentSchema.safeParse(valid).success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    const result = equipmentSchema.safeParse({ ...valid, name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('name')
    }
  })

  it('rejeita nome maior que 255 caracteres', () => {
    const result = equipmentSchema.safeParse({ ...valid, name: 'a'.repeat(256) })
    expect(result.success).toBe(false)
  })

  it('rejeita categoria inválida', () => {
    const result = equipmentSchema.safeParse({ ...valid, category: 'weapons' })
    expect(result.success).toBe(false)
  })

  it('rejeita status inválido', () => {
    const result = equipmentSchema.safeParse({ ...valid, status: 'broken' })
    expect(result.success).toBe(false)
  })

  it('aceita todos os status válidos', () => {
    for (const status of ['available', 'in_use', 'maintenance', 'retired']) {
      expect(equipmentSchema.safeParse({ ...valid, status }).success).toBe(true)
    }
  })

  it('aceita todas as categorias válidas', () => {
    for (const category of ['tech', 'security', 'communication', 'transport', 'lab', 'other']) {
      expect(equipmentSchema.safeParse({ ...valid, category }).success).toBe(true)
    }
  })
})

// ── vehicleSchema ─────────────────────────────────────────────────────────────

describe('vehicleSchema', () => {
  const valid = {
    name: 'Batmóvel Tumbler',
    type: 'car',
    status: 'available',
  }

  it('aceita dados válidos mínimos', () => {
    expect(vehicleSchema.safeParse(valid).success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    const result = vehicleSchema.safeParse({ ...valid, name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('name')
    }
  })

  it('rejeita tipo inválido', () => {
    const result = vehicleSchema.safeParse({ ...valid, type: 'submarine' })
    expect(result.success).toBe(false)
  })

  it('aceita todos os tipos de veículo', () => {
    for (const type of ['car', 'suv', 'truck', 'motorcycle', 'helicopter', 'aircraft', 'boat', 'other']) {
      expect(vehicleSchema.safeParse({ ...valid, type }).success).toBe(true)
    }
  })

  it('rejeita ano abaixo de 1900', () => {
    const result = vehicleSchema.safeParse({ ...valid, year: 1800 })
    expect(result.success).toBe(false)
  })

  it('aceita ano vazio (campo opcional)', () => {
    expect(vehicleSchema.safeParse({ ...valid, year: '' }).success).toBe(true)
  })

  it('aceita placa dentro do limite', () => {
    expect(vehicleSchema.safeParse({ ...valid, license_plate: 'WYN-0001' }).success).toBe(true)
  })

  it('rejeita placa maior que 20 caracteres', () => {
    const result = vehicleSchema.safeParse({ ...valid, license_plate: 'A'.repeat(21) })
    expect(result.success).toBe(false)
  })
})

// ── securityDeviceSchema ──────────────────────────────────────────────────────

describe('securityDeviceSchema', () => {
  const valid = {
    name: 'Câmera Térmica Norte',
    type: 'camera',
    status: 'active',
    location: 'Corredor Leste',
  }

  it('aceita dados válidos mínimos', () => {
    expect(securityDeviceSchema.safeParse(valid).success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    const result = securityDeviceSchema.safeParse({ ...valid, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita localização vazia', () => {
    const result = securityDeviceSchema.safeParse({ ...valid, location: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('location')
    }
  })

  it('aceita IP válido', () => {
    expect(securityDeviceSchema.safeParse({ ...valid, ip_address: '192.168.1.100' }).success).toBe(true)
  })

  it('rejeita IP inválido', () => {
    const result = securityDeviceSchema.safeParse({ ...valid, ip_address: '999.999.999.999' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('ip_address')
    }
  })

  it('aceita ip_address vazio (campo opcional)', () => {
    expect(securityDeviceSchema.safeParse({ ...valid, ip_address: '' }).success).toBe(true)
  })

  it('rejeita tipo inválido', () => {
    const result = securityDeviceSchema.safeParse({ ...valid, type: 'laser' })
    expect(result.success).toBe(false)
  })

  it('aceita todos os status de dispositivo', () => {
    for (const status of ['active', 'inactive', 'maintenance']) {
      expect(securityDeviceSchema.safeParse({ ...valid, status }).success).toBe(true)
    }
  })
})

// ── extractFieldErrors ────────────────────────────────────────────────────────

describe('extractFieldErrors', () => {
  it('mapeia erros Zod para objeto de campo → mensagem', () => {
    const result = equipmentSchema.safeParse({ name: '', category: 'invalid', status: 'available' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = extractFieldErrors(result.error)
      expect(errors.name).toBe('Nome é obrigatório')
      expect(errors.category).toBe('Categoria inválida')
    }
  })

  it('retorna apenas o primeiro erro por campo', () => {
    const result = equipmentSchema.safeParse({ name: 'a'.repeat(300), category: 'tech', status: 'available' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = extractFieldErrors(result.error)
      expect(Object.keys(errors).filter((k) => k === 'name').length).toBe(1)
    }
  })
})
