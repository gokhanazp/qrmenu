'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateSubscription } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface UpdateSubscriptionFormProps {
  restaurantId: string
  currentSubscription?: {
    plan: string
    status: string
    current_period_start?: string
    current_period_end?: string
  }
}

export function UpdateSubscriptionForm({
  restaurantId,
  currentSubscription
}: UpdateSubscriptionFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    plan: currentSubscription?.plan || 'free',
    status: currentSubscription?.status || 'active',
    current_period_start: currentSubscription?.current_period_start
      ? new Date(currentSubscription.current_period_start).toISOString().split('T')[0]
      : '',
    current_period_end: currentSubscription?.current_period_end
      ? new Date(currentSubscription.current_period_end).toISOString().split('T')[0]
      : '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const result = await updateSubscription({
        restaurantId,
        plan: formData.plan,
        status: formData.status,
        current_period_start: formData.current_period_start || undefined,
        current_period_end: formData.current_period_end || undefined,
      })

      if (result.success) {
        setSuccess('Abonelik başarıyla güncellendi')
        router.refresh()
      } else {
        setError(result.error || 'Güncelleme başarısız')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plan">Plan</Label>
          <select
            id="plan"
            value={formData.plan}
            onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
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
            <option value="inactive">Inactive</option>
            <option value="past_due">Past Due</option>
            <option value="canceled">Canceled</option>
            <option value="trialing">Trialing</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_date">Başlangıç Tarihi</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.current_period_start}
            onChange={(e) => setFormData({ ...formData, current_period_start: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">Bitiş Tarihi</Label>
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
  )
}