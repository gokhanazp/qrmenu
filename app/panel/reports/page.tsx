import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getReports } from '@/app/actions/reports'
import { ReportsClient } from './reports-client'

export const dynamic = 'force-dynamic'

export default async function ReportsPage({ searchParams }: { searchParams?: { days?: string; scope?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const days = Number(searchParams?.days)
  const data = await getReports({ days: [1, 7, 30].includes(days) ? days : 1, scope: searchParams?.scope === 'all' ? 'all' : 'current' })
  return <ReportsClient data={data} />
}
