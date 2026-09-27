/**
 * Eşleştirme ÖNERİLERİ (saf). Yalnızca aynı restoran içindeki adaylar
 * verilmelidir; bu modül restoran sınırını bilmez, çağıran taraf listeyi
 * zaten restorana göre süzmüş olmalıdır. Öneri asla otomatik eşleştirme
 * değildir; kullanıcı onaylar.
 */

const UNIT_PATTERN = /\b\d+([.,]\d+)?\s?(gr|g|kg|ml|lt|l|cl|cc|adet|ad|porsiyon|prs|pcs|pc|li|lı|lu|lü|x)\b/g

export function normalizeProductName(name: string): string {
  return (name || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/i̇/g, 'i')
    .replace(UNIT_PATTERN, ' ')
    .replace(/[^a-zçğıöşü0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function bigrams(text: string): Map<string, number> {
  const map = new Map<string, number>()
  const s = text.replace(/ /g, '')
  for (let i = 0; i < s.length - 1; i++) {
    const g = s.slice(i, i + 2)
    map.set(g, (map.get(g) || 0) + 1)
  }
  return map
}

/** Sørensen–Dice (karakter ikilileri) */
export function diceSimilarity(a: string, b: string): number {
  const na = normalizeProductName(a)
  const nb = normalizeProductName(b)
  if (!na || !nb) return 0
  if (na === nb) return 1
  const ga = bigrams(na)
  const gb = bigrams(nb)
  let inter = 0
  let total = 0
  ga.forEach((c, g) => {
    total += c
    inter += Math.min(c, gb.get(g) || 0)
  })
  gb.forEach((c) => {
    total += c
  })
  return total === 0 ? 0 : (2 * inter) / total
}

/** Kelime kümesi Jaccard */
export function tokenSimilarity(a: string, b: string): number {
  const ta = new Set(normalizeProductName(a).split(' ').filter(Boolean))
  const tb = new Set(normalizeProductName(b).split(' ').filter(Boolean))
  if (ta.size === 0 || tb.size === 0) return 0
  let inter = 0
  ta.forEach((t) => {
    if (tb.has(t)) inter++
  })
  return inter / (ta.size + tb.size - inter)
}

export function nameSimilarity(a: string, b: string): number {
  return Math.max(diceSimilarity(a, b), tokenSimilarity(a, b))
}

export interface LocalCandidate {
  id: string
  name: string
  sku?: string | null
}

export interface ExternalForMatch {
  name: string
  sku?: string | null
}

export type MatchReason = 'sku' | 'exact' | 'similar'

export interface MatchSuggestion {
  localProductId: string
  score: number
  reason: MatchReason
}

function normalizeSku(sku: string | null | undefined): string {
  return (sku || '').trim().toLowerCase()
}

export function suggestMatches(
  external: ExternalForMatch,
  locals: LocalCandidate[],
  options: { limit?: number; minScore?: number } = {}
): MatchSuggestion[] {
  const limit = options.limit ?? 3
  const minScore = options.minScore ?? 0.5
  const extSku = normalizeSku(external.sku)
  const extNorm = normalizeProductName(external.name)
  const out: MatchSuggestion[] = []

  for (const local of locals) {
    if (extSku && normalizeSku(local.sku) === extSku) {
      out.push({ localProductId: local.id, score: 1, reason: 'sku' })
      continue
    }
    if (extNorm && normalizeProductName(local.name) === extNorm) {
      out.push({ localProductId: local.id, score: 1, reason: 'exact' })
      continue
    }
    const score = nameSimilarity(external.name, local.name)
    if (score >= minScore) out.push({ localProductId: local.id, score: Math.round(score * 100) / 100, reason: 'similar' })
  }

  const order: Record<MatchReason, number> = { sku: 0, exact: 1, similar: 2 }
  return out
    .sort((a, b) => b.score - a.score || order[a.reason] - order[b.reason])
    .slice(0, limit)
}

/** Birebir isim eşleşmesi için anahtar: birim/gramaj SİLİNMEZ (200gr ≠ 500gr), yalnızca boşluk ve harf büyüklüğü. */
export function exactNameKey(name: string): string {
  return (name || '').toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim()
}

export interface ExactMatchPair {
  externalRowId: string
  externalName: string
  localProductId: string
  localName: string
}

/**
 * Toplu "birebir eşleştir" adayları: platform ürünü ile yerel ürün adı birebir aynı
 * ve HER İKİ tarafta da tek aday varsa. Kullanıcı listeyi görüp onaylar; otomatik
 * uygulanmaz.
 */
export function exactNameMatches(
  externals: { id: string; name: string }[],
  locals: { id: string; name: string }[]
): ExactMatchPair[] {
  const localsByKey = new Map<string, { id: string; name: string }[]>()
  for (const l of locals) {
    const k = exactNameKey(l.name)
    if (!k) continue
    localsByKey.set(k, [...(localsByKey.get(k) || []), l])
  }
  const externalsByKey = new Map<string, number>()
  for (const e of externals) externalsByKey.set(exactNameKey(e.name), (externalsByKey.get(exactNameKey(e.name)) || 0) + 1)

  const out: ExactMatchPair[] = []
  for (const e of externals) {
    const k = exactNameKey(e.name)
    const candidates = localsByKey.get(k) || []
    if (candidates.length !== 1 || (externalsByKey.get(k) || 0) !== 1) continue
    out.push({ externalRowId: e.id, externalName: e.name, localProductId: candidates[0].id, localName: candidates[0].name })
  }
  return out
}

/** Platform kategorisi "Mezeler, En Sevilenler" → "Mezeler" (ilk bölüm). */
export function primaryCategoryName(category: string | null | undefined): string | null {
  const first = (category || '').split(',')[0]?.trim()
  return first || null
}
