import { describe, it, expect } from 'vitest'
import { hasPermission, ROLE_PERMISSIONS } from '@/lib/types/database'

describe('ROLE_PERMISSIONS', () => {
  it('employee só pode visualizar', () => {
    expect(ROLE_PERMISSIONS.employee.canView).toBe(true)
    expect(ROLE_PERMISSIONS.employee.canCreate).toBe(false)
    expect(ROLE_PERMISSIONS.employee.canUpdate).toBe(false)
    expect(ROLE_PERMISSIONS.employee.canDelete).toBe(false)
  })

  it('manager pode criar e editar mas não excluir', () => {
    expect(ROLE_PERMISSIONS.manager.canCreate).toBe(true)
    expect(ROLE_PERMISSIONS.manager.canUpdate).toBe(true)
    expect(ROLE_PERMISSIONS.manager.canDelete).toBe(false)
  })

  it('admin tem todas as permissões', () => {
    expect(ROLE_PERMISSIONS.admin.canView).toBe(true)
    expect(ROLE_PERMISSIONS.admin.canCreate).toBe(true)
    expect(ROLE_PERMISSIONS.admin.canUpdate).toBe(true)
    expect(ROLE_PERMISSIONS.admin.canDelete).toBe(true)
  })
})

describe('hasPermission', () => {
  it('retorna true para employee com canView', () => {
    expect(hasPermission('employee', 'canView')).toBe(true)
  })

  it('retorna false para employee com canCreate', () => {
    expect(hasPermission('employee', 'canCreate')).toBe(false)
  })

  it('retorna false para manager com canDelete', () => {
    expect(hasPermission('manager', 'canDelete')).toBe(false)
  })

  it('retorna true para admin com canDelete', () => {
    expect(hasPermission('admin', 'canDelete')).toBe(true)
  })
})
