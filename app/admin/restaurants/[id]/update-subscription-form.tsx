'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateSubscription } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isPro, getDaysRemaining, isTrialExpired } from '@/lib/subscription'

interface UpdateSubscriptionFormProps {
  restaurantId: string
  restaurantCreatedAt?: string
  currentSubscription?: {
    plan?: string | null
    status?: string | null
    current_period_start?: string | null
    current_period_end?: string | null
    trial_ends_at?: string | null
  } | null
}

function toDateInput(value?: string | null): string {
  if (!value) return ''
  return new Date(value).toISOString().split('T')[0]
}

function twoMonthsFromNow(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 2)
  return d.toISOString().split('T')[0]
}

export function UpdateSubscriptionForm({
  restaurantId,
  restaurantCreatedAt,
  currentSubscription
}: UpdateSubscriptionFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    plan: currentSubscription?.plan || 'free',
    status: currentSubscription?.status || 'active',
    current_period_start: toDateInput(currentSubscription?.current_period_start),
    current_period_end: toDateInput(currentSubscription?.current_period_end),
    trial_ends_at: toDateInput(currentSubscription?.trial_ends_at),
  })

  // Mevcut durumu özetle
  const proPlan = isPro(currentSubscription)
  const days = getDaysRemaining(currentSubscription, restaurantCreatedAt)
  const expired = isTrialExpired(currentSubscription, restaurantCreatedAt)

  async function save(payload: {
    plan: string
    status: string
    current_period_start?: string
    current_period_end?: string
    trial_ends_at?: string | null
  }) {
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const result = await updateSubscription({ restaurantId, ...payload })
      if (result.success) {
        setSuccess('Abonelik başarıyla güncellendi')
        router.refresh()
      } else {
        setError(result.error || 'Güncelleme başarısız')
      }
    } catch {
      setError('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await save({
      plan: formData.plan,
      status: formData.status,
      current_period_start: formData.current_period_start || undefined,
      current_period_end: formData.current_period_end || undefined,
      trial_ends_at: formData.trial_ends_at || null,
    })
  }

  // Hızlı işlem: Pro yap (süresiz)
  async function makePro() {
    setFormData((f) => ({ ...f, plan: 'pro', status: 'active', trial_ends_at: '' }))
    await save({ plan: 'pro', status: 'active', trial_ends_at: null })
  }

  // Hızlı işlem: 2 ay ücretsiz deneme ver / uzat
  async function giveTrial() {
    const end = twoMonthsFromNow()
    setFormData((f) => ({ ...f, plan: 'free', status: 'trialing', trial_ends_at: end }))
    await save({ plan: 'free', status: 'trialing', trial_ends_at: end })
  }

  // Hızlı işlem: menüyü kapat (deneme süresini şimdi bitir)
  async function closeNow() {
    const today = new Date().toISOString().split('T')[0]
    setFormData((f) => ({ ...f, plan: 'free', status: 'canceled', trial_ends_at: today }))
    await save({ plan: 'free', status: 'canceled', trial_ends_at: today })
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Mevcut durum özeti */}
      <div className={`rounded-lg p-4 border ${
        proPlan
          ? 'bg-emerald-50 border-emerald-200'
          : expired
            ? 'bg-red-50 border-red-200'
            : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Mevcut Durum</p>
            <p className="text-lg font-bold text-gray-900">
              {proPlan
                ? 'Pro — Süresiz (menü açık)'
                : expired
                  ? 'Ücretsiz deneme doldu — MENÜ KAPALI'
                  : `Ücretsiz deneme — ${days ?? 0} gün kaldı`}
            </p>
          </div>
          <span className={`material-symbols-outlined text-3xl ${
            proPlan ? 'text-emerald-600' : expired ? 'text-red-600' : 'text-amber-600'
          }`}>
            {proPlan ? 'verified' : expired ? 'lock' : 'timer'}
          </span>
        </div>
      </div>

      {/* Hızlı işlemler */}
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={makePro} disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <span className="material-symbols-outlined mr-1" style={{ fontSize: '18px' }}>verified</span>
          Pro Yap (Süresiz)
        </Button>
        <Button type="button" variant="outline" onClick={giveTrial} disabled={saving}>
          <span className="material-symbols-outlined mr-1" style={{ fontSize: '18px' }}>restart_alt</span>
          2 Ay Deneme Ver
        </Button>
        <Button type="button" variant="outline" onClick={closeNow} disabled={saving}
          className="border-red-300 text-red-600 hover:bg-red-50">
          <span className="material-symbols-outlined mr-1" style={{ fontSize: '18px' }}>lock</span>
          Menüyü Kapat
        </Button>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm font-medium text-gray-500 mb-3">Gelişmiş (manuel düzenleme)</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan">Plan</Label>
              <select
                id="plan"
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="free">Free (Ücretsiz Deneme)</option>
                <option value="pro">Pro (Ücretli)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Durum</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="trialing">Trialing (Deneme)</option>
                <option value="inactive">Inactive</option>
                <option value="past_due">Past Due</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trial_ends_at">Deneme Bitiş Tarihi</Label>
              <Input
                id="trial_ends_at"
                type="date"
                value={formData.trial_ends_at}
                onChange={(e) => setFormData({ ...formData, trial_ends_at: e.target.value })}
              />
              <p className="text-xs text-gray-400">Free planda bu tarih geçince menü kapanır. Pro planda önemsizdir.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Ödeme Dönemi Bitişi (Pro)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.current_period_end}
                onChange={(e) => setFormData({ ...formData, current_period_end: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Aboneliği Güncelle'}
          </Button>
        </form>
      </div>
    </div>
  )
}
