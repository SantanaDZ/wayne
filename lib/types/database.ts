// Wayne Industries Database Types

export type UserRole = 'employee' | 'manager' | 'admin'
export type ResourceStatus = 'available' | 'in_use' | 'maintenance' | 'retired'
export type DeviceStatus = 'active' | 'inactive' | 'maintenance'

export interface Location {
  id: string
  name: string
  description: string | null
  image_url: string | null
  created_at: string
}

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  department: string | null
  pin: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Equipment {
  id: string
  name: string
  description: string | null
  category: string
  status: ResourceStatus
  serial_number: string | null
  location: string | null
  assigned_to: string | null
  created_by: string
  created_at: string
  updated_at: string
  image_url: string | null
  // Joined fields
  assigned_to_profile?: Profile
  created_by_profile?: Profile
}

export interface Vehicle {
  id: string
  name: string
  description: string | null
  type: string
  status: ResourceStatus
  plate_number: string | null
  model: string | null
  year: number | null
  location: string | null
  assigned_to: string | null
  created_by: string
  created_at: string
  updated_at: string
  image_url: string | null
  // Joined fields
  assigned_to_profile?: Profile
  created_by_profile?: Profile
}

export interface SecurityDevice {
  id: string
  name: string
  description: string | null
  type: string
  status: DeviceStatus
  serial_number: string | null
  location: string
  ip_address: string | null
  last_maintenance: string | null
  created_by: string
  created_at: string
  updated_at: string
  image_url: string | null
  // Joined fields
  created_by_profile?: Profile
}

export type SecurityLevel = 'low' | 'medium' | 'high' | 'maximum'
export type AreaStatus = 'operational' | 'lockdown' | 'maintenance'

export interface RestrictedArea {
  id: string
  name: string
  description: string | null
  security_level: SecurityLevel
  status: AreaStatus
  created_at: string
  updated_at: string
}

export interface AreaAccess {
  id: string
  area_id: string
  profile_id: string
  granted_by: string
  granted_at: string
  expires_at: string | null
  area?: RestrictedArea
  profile?: Profile
  granted_by_profile?: Profile
}


export interface ActivityLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string | null
  details: Record<string, unknown> | null
  created_at: string
  // Joined fields
  user?: Profile
}

// Form types for creating/updating resources
export interface CreateEquipmentInput {
  name: string
  description?: string
  category: string
  status?: ResourceStatus
  serial_number?: string
  location?: string
  assigned_to?: string
  image_url?: string
}

export interface CreateVehicleInput {
  name: string
  description?: string
  type: string
  status?: ResourceStatus
  plate_number?: string
  model?: string
  year?: number
  location?: string
  assigned_to?: string
  image_url?: string
}

export interface CreateSecurityDeviceInput {
  name: string
  description?: string
  type: string
  status?: DeviceStatus
  serial_number?: string
  location: string
  ip_address?: string
  image_url?: string
}

// Dashboard statistics
export interface DashboardStats {
  totalEquipment: number
  totalVehicles: number
  totalSecurityDevices: number
  equipmentByStatus: Record<ResourceStatus, number>
  vehiclesByStatus: Record<ResourceStatus, number>
  devicesByStatus: Record<DeviceStatus, number>
  recentActivities: ActivityLog[]
}

// Permission helpers
export const ROLE_PERMISSIONS = {
  employee: {
    canView: true,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  },
  manager: {
    canView: true,
    canCreate: true,
    canUpdate: true,
    canDelete: false,
  },
  admin: {
    canView: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  },
} as const

export function hasPermission(role: UserRole, action: keyof typeof ROLE_PERMISSIONS.employee): boolean {
  return ROLE_PERMISSIONS[role][action]
}
