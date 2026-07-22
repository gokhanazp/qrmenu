import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyReviews } from '@/app/actions/reviews'
import { PanelReviewsClient } from '@/components/panel-reviews-client'

export default async function PanelReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const result = await getMyReviews()
  const reviews = 'reviews' in result ? result.reviews : []

  return <PanelReviewsClient initialReviews={reviews as never[]} />
}
