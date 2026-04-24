import { z } from 'zod'

export const equipmentSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  description: z.string().max(1000, 'Descrição muito longa').optional(),
  category: z.enum(['tech', 'security', 'communication', 'transport', 'lab', 'other'], {
    errorMap: () => ({ message: 'Categoria inválida' }),
  }),
  status: z.enum(['available', 'in_use', 'maintenance', 'retired'], {
    errorMap: () => ({ message: 'Status inválido' }),
  }),
  serial_number: z.string().max(100, 'Número de série muito longo').optional(),
  location: z.string().max(255, 'Localização muito longa').optional(),
  assigned_to: z.string().optional(),
  image_url: z.string().max(500, 'URL da imagem muito longa').optional(),
})

export const vehicleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  description: z.string().max(1000, 'Descrição muito longa').optional(),
  type: z.enum(['car', 'suv', 'truck', 'motorcycle', 'helicopter', 'aircraft', 'boat', 'other'], {
    errorMap: () => ({ message: 'Tipo inválido' }),
  }),
  status: z.enum(['available', 'in_use', 'maintenance', 'retired'], {
    errorMap: () => ({ message: 'Status inválido' }),
  }),
  license_plate: z.string().max(20, 'Placa muito longa').optional(),
  model: z.string().max(255, 'Modelo muito longo').optional(),
  year: z
    .union([
      z.coerce.number().int().min(1900, 'Ano inválido').max(2100, 'Ano inválido'),
      z.literal(''),
    ])
    .optional(),
  location: z.string().max(255, 'Localização muito longa').optional(),
  assigned_to: z.string().optional(),
  image_url: z.string().max(500, 'URL da imagem muito longa').optional(),
})

const ipv4Regex = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/

export const securityDeviceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  description: z.string().max(1000, 'Descrição muito longa').optional(),
  type: z.enum(['camera', 'sensor', 'biometric', 'alarm', 'other'], {
    errorMap: () => ({ message: 'Tipo inválido' }),
  }),
  status: z.enum(['active', 'inactive', 'maintenance'], {
    errorMap: () => ({ message: 'Status inválido' }),
  }),
  serial_number: z.string().max(100, 'Número de série muito longo').optional(),
  location: z.string().min(1, 'Localização é obrigatória').max(255, 'Localização muito longa'),
  ip_address: z
    .string()
    .refine((v) => v === '' || ipv4Regex.test(v), { message: 'Endereço IPv4 inválido' })
    .optional(),
  image_url: z.string().max(500, 'URL da imagem muito longa').optional(),
})

export type EquipmentFormData = z.infer<typeof equipmentSchema>
export type VehicleFormData = z.infer<typeof vehicleSchema>
export type SecurityDeviceFormData = z.infer<typeof securityDeviceSchema>

export function extractFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString()
    if (key && !fieldErrors[key]) {
      fieldErrors[key] = issue.message
    }
  }
  return fieldErrors
}
