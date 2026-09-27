import { describe, expect, it } from 'vitest'
import {
  canManageContent,
  isBranchRole,
  isRestaurantRole,
  isTenantRole,
  roleIn,
  strongerRole,
  OPERATIONS_ROLES,
  REPORT_ROLES,
} from '@/lib/auth/roles'

describe('roles', () => {
  it('rol güç sırası: owner > branch_manager > staff > accountant', () => {
    expect(strongerRole('staff', 'owner')).toBe('owner')
    expect(strongerRole('branch_manager', 'staff')).toBe('branch_manager')
    expect(strongerRole('accountant', 'kitchen')).toBe('kitchen')
    expect(strongerRole(null, 'staff')).toBe('staff')
    expect(strongerRole('admin', null)).toBe('admin')
    expect(strongerRole(null, null)).toBeNull()
  })

  it('içerik yönetimi: staff ve kitchen yapamaz', () => {
    expect(canManageContent('owner')).toBe(true)
    expect(canManageContent('branch_manager')).toBe(true)
    expect(canManageContent('staff')).toBe(false)
    expect(canManageContent('kitchen')).toBe(false)
    expect(canManageContent('accountant')).toBe(false)
    expect(canManageContent(null)).toBe(false)
  })

  it('operasyon ve rapor rolleri', () => {
    expect(roleIn('staff', OPERATIONS_ROLES)).toBe(true)
    expect(roleIn('kitchen', OPERATIONS_ROLES)).toBe(false)
    expect(roleIn('accountant', REPORT_ROLES)).toBe(true)
    expect(roleIn('staff', REPORT_ROLES)).toBe(false)
  })

  it('rol doğrulama', () => {
    expect(isTenantRole('owner')).toBe(true)
    expect(isTenantRole('staff')).toBe(false)
    expect(isBranchRole('kitchen')).toBe(true)
    expect(isRestaurantRole('super_admin')).toBe(true)
    expect(isRestaurantRole('root')).toBe(false)
    expect(isRestaurantRole(null)).toBe(false)
  })
})
