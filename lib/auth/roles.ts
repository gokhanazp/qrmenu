/**
 * Rol modeli — saf, sunucu/istemci ortak.
 *
 *  super_admin    : QRMenuList yönetimi (admin_users)
 *  owner          : tenant sahibi (restaurants.owner_user_id veya tenant_users.owner)
 *  admin          : tenant yöneticisi
 *  accountant     : tenant raporları (salt okunur)
 *  branch_manager : yalnızca yetkili şubeler
 *  staff          : sipariş ve stok
 *  kitchen        : aktif sipariş ekranı
 *
 * DB tarafındaki karşılığı: restaurant_role() fonksiyonu (migration 022).
 */

export const TENANT_ROLES = ['owner', 'admin', 'accountant'] as const
export const RESTAURANT_ROLES = ['branch_manager', 'staff', 'kitchen'] as const

export type TenantRole = (typeof TENANT_ROLES)[number]
export type BranchRole = (typeof RESTAURANT_ROLES)[number]
export type RestaurantRole = 'super_admin' | TenantRole | BranchRole

export const ROLE_LABELS: Record<RestaurantRole, string> = {
  super_admin: 'QRMenuList Yönetici',
  owner: 'Sahip',
  admin: 'Yönetici',
  accountant: 'Muhasebe',
  branch_manager: 'Şube Müdürü',
  staff: 'Personel',
  kitchen: 'Mutfak',
}

const ROLE_POWER: Record<RestaurantRole, number> = {
  super_admin: 100,
  owner: 90,
  admin: 80,
  branch_manager: 70,
  staff: 50,
  kitchen: 40,
  accountant: 30,
}

export function isTenantRole(value: string): value is TenantRole {
  return (TENANT_ROLES as readonly string[]).includes(value)
}

export function isBranchRole(value: string): value is BranchRole {
  return (RESTAURANT_ROLES as readonly string[]).includes(value)
}

export function isRestaurantRole(value: string | null | undefined): value is RestaurantRole {
  return value === 'super_admin' || isTenantRole(value || '') || isBranchRole(value || '')
}

/** İki rolden güçlü olanı döndürür. */
export function strongerRole(a: RestaurantRole | null, b: RestaurantRole | null): RestaurantRole | null {
  if (!a) return b
  if (!b) return a
  return ROLE_POWER[a] >= ROLE_POWER[b] ? a : b
}

/** Menü içeriği (ürün, kategori, ayarlar, yorum) yönetebilir mi? */
export const CONTENT_MANAGER_ROLES: RestaurantRole[] = ['super_admin', 'owner', 'admin', 'branch_manager']

/** Sipariş ve stok işlemleri yapabilir mi? */
export const OPERATIONS_ROLES: RestaurantRole[] = ['super_admin', 'owner', 'admin', 'branch_manager', 'staff']

/** Aktif sipariş ekranını görebilir mi? */
export const ORDER_VIEW_ROLES: RestaurantRole[] = [...OPERATIONS_ROLES, 'kitchen']

/** Raporları görebilir mi? */
export const REPORT_ROLES: RestaurantRole[] = ['super_admin', 'owner', 'admin', 'branch_manager', 'accountant']

/** Tenant üyelerini / şube kullanıcılarını yönetebilir mi? */
export const USER_MANAGER_ROLES: RestaurantRole[] = ['super_admin', 'owner', 'admin']

/** Pazaryeri kimlik bilgilerini (API key vb.) yönetebilir mi? */
export const INTEGRATION_MANAGER_ROLES: RestaurantRole[] = ['super_admin', 'owner', 'admin']

export function roleIn(role: RestaurantRole | null | undefined, allowed: RestaurantRole[]): boolean {
  return Boolean(role && allowed.includes(role))
}

export function canManageContent(role: RestaurantRole | null | undefined): boolean {
  return roleIn(role, CONTENT_MANAGER_ROLES)
}
