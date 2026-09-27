'use client'

/**
 * orders tablosundaki INSERT/UPDATE olaylarına abone olur (Supabase Realtime,
 * RLS ile restoran bazında süzülür). Bağlantı koparsa 30 sn'lik polling zaten
 * devrede olduğu için veri kaybı olmaz.
 */
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

// eslint-disable-next-line
export type OrderRealtimeRow = Record<string, any>

export function useOrdersRealtime(
  restaurantId: string | null | undefined,
  handlers: { onInsert?: (row: OrderRealtimeRow) => void; onUpdate?: (row: OrderRealtimeRow) => void; onStatus?: (status: string) => void }
) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (!restaurantId) return
    let supabase: ReturnType<typeof createClient>
    try {
      supabase = createClient()
    } catch {
      return
    }
    const channel = supabase
      .channel(`orders:${restaurantId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` }, (payload) => {
        handlersRef.current.onInsert?.(payload.new as OrderRealtimeRow)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` }, (payload) => {
        handlersRef.current.onUpdate?.(payload.new as OrderRealtimeRow)
      })
      .subscribe((status) => {
        handlersRef.current.onStatus?.(status)
      })
    return () => {
      supabase.removeChannel(channel)
    }
  }, [restaurantId])
}
