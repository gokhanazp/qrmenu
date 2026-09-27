'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateTenant } from '@/app/actions/tenants'

export function TenantSettingsForm({
  tenant,
}: {
  tenant: { id: string; name: string; plan: string; status: string }
}) {
  const router = useRouter()
  const [name, setName] = useState(tenant.name)
  const [plan, setPlan] = useState(tenant.plan)
  const [status, setStatus] = useState(tenant.status)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    const result = await updateTenant({ tenantId: tenant.id, name, plan, status })
    setSaving(false)
    if (result.success) {
      setMessage({ type: 'ok', text: 'Kaydedildi' })
      router.refresh()
    } else {
      setMessage({ type: 'err', text: result.error || 'Bir hata oluştu' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-4 gap-4 items-end">
      <div className="md:col-span-2">
        <Label htmlFor="tenant_name">Tenant Adı</Label>
        <Input id="tenant_name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="tenant_plan">Plan</Label>
        <Input id="tenant_plan" value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="standard" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="tenant_status">Durum</Label>
        <select
          id="tenant_status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 block w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
        >
          <option value="active">Aktif</option>
          <option value="suspended">Askıda</option>
        </select>
      </div>
      <div className="md:col-span-4 flex items-center gap-3">
        <Button type="submit" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</Button>
        {message && (
          <span className={`text-sm ${message.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</span>
        )}
      </div>
    </form>
  )
}
