/**
 * Freemium abonelik mantığı (2 ay ücretsiz deneme).
 *
 * Kural:
 *  - plan = 'pro'  -> menü her zaman açık, süre kısıtı yok.
 *  - plan = 'free' -> yalnızca deneme süresi (trial_ends_at) dolmadıysa menü açık.
 *  - Deneme dolduğunda public menü kapanır; restoranın Pro'ya geçmesi (site iletişim
 *    numarası üzerinden ödeme) gerekir. Pro'ya geçişi admin panelden tanımlar.
 */

export const TRIAL_DAYS = 60 // ~2 ay

export interface PlanInfo {
  plan?: string | null
  status?: string | null
  trial_ends_at?: string | null
}

export function isPro(sub?: PlanInfo | null): boolean {
  return sub?.plan === 'pro'
}

/**
 * Supabase embed sonucunu normalize eder.
 * `subscriptions.restaurant_id` UNIQUE olduğu için PostgREST birebir ilişkiyi
 * NESNE olarak döndürür; bazı durumlarda DİZİ de gelebilir. İkisini de destekler.
 */
export function extractSubscription(raw: unknown): PlanInfo | null {
  if (!raw) return null
  if (Array.isArray(raw)) return (raw[0] as PlanInfo) ?? null
  return raw as PlanInfo
}

/**
 * Deneme bitiş tarihini döndürür.
 * trial_ends_at kayıtlıysa onu, değilse (eski kayıtlar) created_at + 2 ay kullanır.
 */
export function getTrialEndsAt(
  sub?: PlanInfo | null,
  createdAt?: string | null
): Date | null {
  if (sub?.trial_ends_at) return new Date(sub.trial_ends_at)
  if (createdAt) {
    const d = new Date(createdAt)
    d.setDate(d.getDate() + TRIAL_DAYS)
    return d
  }
  return null
}

/**
 * Menü herkese açık görüntülenebilir mi?
 * Pro ise her zaman; free ise deneme süresi dolmamışsa.
 * Bilgi yoksa (bilinmeyen durum) engellemez -> güvenli varsayılan.
 */
export function isMenuAccessible(
  sub?: PlanInfo | null,
  createdAt?: string | null,
  now: Date = new Date()
): boolean {
  // Abonelik bilgisi hiç yoksa engelleme (güvenli varsayılan).
  // Böylece migration/RLS gecikmesi mevcut menüleri kapatmaz.
  if (!sub) return true
  if (isPro(sub)) return true
  const end = getTrialEndsAt(sub, createdAt)
  if (!end) return true
  return now.getTime() < end.getTime()
}

/** Deneme süresi doldu mu? (Pro ise veya bilgi yoksa asla dolmaz.) */
export function isTrialExpired(
  sub?: PlanInfo | null,
  createdAt?: string | null,
  now: Date = new Date()
): boolean {
  if (!sub) return false
  if (isPro(sub)) return false
  const end = getTrialEndsAt(sub, createdAt)
  if (!end) return false
  return now.getTime() >= end.getTime()
}

/**
 * Deneme bitişine kalan gün sayısı. Pro ise null döner (süresiz).
 * Süre dolmuşsa 0 veya negatif olabilir; ekranda 0'a sabitlemek arayanın işi.
 */
export function getDaysRemaining(
  sub?: PlanInfo | null,
  createdAt?: string | null,
  now: Date = new Date()
): number | null {
  if (isPro(sub)) return null
  const end = getTrialEndsAt(sub, createdAt)
  if (!end) return null
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
