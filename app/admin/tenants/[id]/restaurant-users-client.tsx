'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addRestaurantUser, removeRestaurantUser } from '@/app/actions/tenants'
import { RESTAURANT_ROLES, ROLE_LABELS, type BranchRole } from '@/lib/auth/roles'

export function RestaurantUsersClient({
  restaurantId,
  users,
}: {
  restaurantId: string
  users: { userId: string; email: string; role: BranchRole }[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string>('staff')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const result = await addRestaurantUser({ restaurantId, email, role, password: password || undefined })
    setSaving(false)
    if (result.success) {
      setEmail('')
      setPassword('')
      setOpen(false)
      router.refresh()
    } else {
      setError(result.error || 'Bir hata oluştu')
    }
  }

  const handleRemove = async (userId: string, userEmail: string) => {
    if (!confirm(`${userEmail} şubeden çıkarılsın mı?`)) return
    const result = await removeRestaurantUser({ restaurantId, userId })
    if (result.success) router.refresh()
    else alert(result.error || 'Bir hata oluştu')
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        {users.length === 0 && <span className="text-xs text-slate-400">Şube kullanıcısı yok</span>}
        {users.map((u) => (
          <span key={u.userId} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-xs text-slate-700">
            {u.email} · {ROLE_LABELS[u.role]}
            <button type="button" onClick={() => handleRemove(u.userId, u.email)} className="ml-1 text-red-500 hover:text-red-700" aria-label="Çıkar">
              ×
            </button>
          </span>
        ))}
        <button type="button" onClick={() => setOpen((v) => !v)} className="text-xs font-semibold text-blue-600 hover:text-blue-800">
          {open ? 'Vazgeç' : '+ Şube kullanıcısı ekle'}
        </button>
      </div>
      {open && (
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta" required className="sm:w-56 h-9" />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="h-9 rounded-md border border-gray-300 px-2 text-sm bg-white">
            {RESTAURANT_ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifre (yeni kullanıcı)" className="sm:w-44 h-9" autoComplete="new-password" />
          <Button type="submit" size="sm" disabled={saving}>{saving ? '...' : 'Ekle'}</Button>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </form>
      )}
    </div>
  )
}
