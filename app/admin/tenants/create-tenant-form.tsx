'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createTenant } from '@/app/actions/tenants'

export function CreateTenantForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const result = await createTenant({ name })
    setSaving(false)
    if (result.success && result.tenantId) {
      setName('')
      setOpen(false)
      router.push(`/admin/tenants/${result.tenantId}`)
      router.refresh()
    } else {
      setError(result.error || 'Bir hata oluştu')
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
        <span className="material-symbols-outlined mr-2" style={{ fontSize: '20px' }}>add</span>
        Yeni Tenant
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Şirket / marka adı"
        autoFocus
        className="sm:w-64"
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={saving || name.trim().length < 2}>
          {saving ? 'Oluşturuluyor...' : 'Oluştur'}
        </Button>
        <Button type="button" variant="outline" onClick={() => { setOpen(false); setError(null) }}>
          İptal
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  )
}
