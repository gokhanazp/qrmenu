'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addTenantMember, removeTenantMember, type TenantMember } from '@/app/actions/tenants'
import { ROLE_LABELS, TENANT_ROLES } from '@/lib/auth/roles'

export function TenantMembersClient({ tenantId, members }: { tenantId: string; members: TenantMember[] }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string>('admin')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    const result = await addTenantMember({ tenantId, email, role, password: password || undefined })
    setSaving(false)
    if (result.success) {
      setMessage({ type: 'ok', text: result.created ? `${result.email} oluşturuldu ve eklendi` : `${result.email} eklendi` })
      setEmail('')
      setPassword('')
      router.refresh()
    } else {
      setMessage({ type: 'err', text: result.error || 'Bir hata oluştu' })
    }
  }

  const handleRemove = async (userId: string, memberEmail: string) => {
    if (!confirm(`${memberEmail} tenant'tan çıkarılsın mı?`)) return
    setRemoving(userId)
    const result = await removeTenantMember({ tenantId, userId })
    setRemoving(null)
    if (result.success) router.refresh()
    else alert(result.error || 'Bir hata oluştu')
  }

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
        {members.length === 0 && <li className="px-4 py-6 text-sm text-slate-500 text-center">Henüz üye yok</li>}
        {members.map((m) => (
          <li key={m.userId} className="flex items-center justify-between gap-3 px-4 py-3 bg-white">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{m.email}</p>
              <p className="text-xs text-slate-500">{ROLE_LABELS[m.role]} · {new Date(m.created_at).toLocaleDateString('tr-TR')}</p>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(m.userId, m.email)}
              disabled={removing === m.userId}
              className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Çıkar
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="grid md:grid-cols-4 gap-3 items-end bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="md:col-span-2">
          <Label htmlFor="member_email">E-posta</Label>
          <Input id="member_email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kullanici@ornek.com" required className="mt-1 bg-white" />
        </div>
        <div>
          <Label htmlFor="member_role">Rol</Label>
          <select id="member_role" value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full h-10 rounded-md border border-gray-300 px-3 text-sm bg-white">
            {TENANT_ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="member_password">Şifre (yeni kullanıcı için)</Label>
          <Input id="member_password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kayıtlıysa boş bırakın" className="mt-1 bg-white" autoComplete="new-password" />
        </div>
        <div className="md:col-span-4 flex items-center gap-3">
          <Button type="submit" disabled={saving}>{saving ? 'Ekleniyor...' : 'Üye Ekle'}</Button>
          {message && <span className={`text-sm ${message.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</span>}
        </div>
      </form>
    </div>
  )
}
