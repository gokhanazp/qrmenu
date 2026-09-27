import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPanelOrders, type PanelOrdersFilter } from '@/app/actions/orders'
import { isOrderStatus, ORDER_SOURCES } from '@/lib/orders/types'
import { OrdersClient } from './orders-client'

export const dynamic = 'force-dynamic'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: { status?: string; source?: string; days?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const status = searchParams?.status
  const source = searchParams?.source
  const days = Number(searchParams?.days)
  const filter: PanelOrdersFilter = {
    status: status === 'all' ? 'all' : status && isOrderStatus(status) ? status : 'active',
    source: source && (ORDER_SOURCES as readonly string[]).includes(source) ? (source as PanelOrdersFilter['source']) : 'all',
    days: [1, 7, 30].includes(days) ? days : 7,
  }

  const data = await getPanelOrders(filter)
  return <OrdersClient data={data} filter={filter} />
}
