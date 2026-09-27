/**
 * Yeni sipariş zili (Web Audio, dosya gerektirmez).
 *
 * Belirgin olması için: üç tekrarlı yükselen üçlü + uzun tutulan tiz nota,
 * kompresör ile yüksek ama patlamayan seviye. Tarayıcılar sayfaya dokunulmadan
 * ses çalmaz; unlockAudio() bir tıklamada çağrılır, attachAudioUnlock() ise
 * sayfadaki ilk dokunuşta otomatik açar (sayfa yenilendikten sonra).
 */
let audioContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!audioContext) audioContext = new Ctor()
  return audioContext
}

export function getAudioState(): 'running' | 'suspended' | 'unavailable' {
  const ctx = getContext()
  if (!ctx) return 'unavailable'
  return ctx.state === 'running' ? 'running' : 'suspended'
}

export async function unlockAudio(): Promise<boolean> {
  const ctx = getContext()
  if (!ctx) return false
  if (ctx.state !== 'running') {
    try { await ctx.resume() } catch { return false }
  }
  return ctx.state === 'running'
}

/** Sayfadaki ilk dokunuş/tuşta sesi açar. Temizleme fonksiyonu döner. */
export function attachAudioUnlock(onUnlocked?: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = () => {
    unlockAudio().then((ok) => {
      if (ok) {
        cleanup()
        onUnlocked?.()
      }
    })
  }
  const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'touchstart']
  const cleanup = () => events.forEach((e) => window.removeEventListener(e, handler))
  events.forEach((e) => window.addEventListener(e, handler, { passive: true }))
  return cleanup
}

/**
 * Zil: 3 tekrar × (yükselen üçlü + tutulan nota). Toplam ≈ 2.6 sn.
 */
export function playOrderChime(): void {
  const ctx = getContext()
  if (!ctx) return
  if (ctx.state !== 'running') {
    // Kullanıcı sayfaya daha önce dokunduysa resume çalışır; aksi hâlde sessiz kalır
    ctx.resume().then(() => schedule(ctx)).catch(() => {})
    return
  }
  schedule(ctx)
}

function schedule(ctx: AudioContext): void {
  const master = ctx.createGain()
  master.gain.value = 1
  const compressor = ctx.createDynamicsCompressor()
  compressor.threshold.value = -12
  compressor.ratio.value = 6
  master.connect(compressor).connect(ctx.destination)

  const t0 = ctx.currentTime + 0.02
  const cycle = 0.85
  const notes = [659.25, 783.99, 1046.5] // E5 G5 C6
  for (let rep = 0; rep < 3; rep++) {
    const base = t0 + rep * cycle
    notes.forEach((freq, i) => tone(ctx, master, freq, base + i * 0.11, 0.16, 0.9))
    // tutulan tiz nota (zil hissi): iki osilatör, hafif detune
    tone(ctx, master, 1046.5, base + 0.33, 0.42, 0.85)
    tone(ctx, master, 1318.5, base + 0.33, 0.42, 0.45, 'triangle')
  }
}

function tone(ctx: AudioContext, out: AudioNode, freq: number, start: number, duration: number, volume: number, type: OscillatorType = 'square'): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015)
  gain.gain.setValueAtTime(volume, start + duration * 0.6)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain).connect(out)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

const STORAGE_KEY = 'qrmenu-order-sound'
/** Bekleyen "Yeni" sipariş varken tekrar aralığı */
export const CHIME_REPEAT_MS = 20_000

export function isSoundEnabled(): boolean {
  try { return window.localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}
export function setSoundEnabled(enabled: boolean): void {
  try { window.localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0') } catch { /* yoksay */ }
}
