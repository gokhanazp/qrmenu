import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPanelIntegrations } from '@/app/actions/integrations'
import { IntegrationsClient } from './integrations-client'

export const dynamic = 'force-dynamic'

export default async function IntegrationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const data = await getPanelIntegrations()
  return <IntegrationsClient data={data} />
}
