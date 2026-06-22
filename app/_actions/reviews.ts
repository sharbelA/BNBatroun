'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionState } from '@/app/_actions/listings'

export async function submitReviewAction(
  listingId: string,
  listingSlug: string,
  rating: number,
  comment: string,
): Promise<ActionState> {
  if (!rating || rating < 1 || rating > 5) return { error: 'Invalid rating' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to leave a review' }

  const { data: profile } = (await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()) as { data: { name: string; role: string } | null }

  // Mirror getCurrentUser() — if no profile row yet, default to guest
  const guestName = profile?.name ?? user.email?.split('@')[0] ?? 'Guest'
  const role = profile?.role ?? 'guest'

  if (role !== 'guest') return { error: 'Only guests can submit reviews' }

  const { error } = await supabase.from('reviews').insert({
    listing_id: listingId,
    guest_id: user.id,
    guest_name: guestName,
    rating,
    comment,
    status: 'pending',
  })

  if (error) return { error: error.message }

  revalidatePath(`/chalets/${listingSlug}`)
  revalidatePath('/admin/reviews')
  return { error: null, success: true }
}

export async function moderateReviewAction(
  reviewId: string,
  status: 'approved' | 'rejected',
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = (await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()) as { data: { role: string } | null }

  if (!profile || profile.role !== 'admin') return { error: 'Admin access required' }

  // Fetch listing slug so we can revalidate the public page
  const { data: review } = (await supabase
    .from('reviews')
    .select('listing_id, listings(slug)')
    .eq('id', reviewId)
    .single()) as { data: { listing_id: string; listings: { slug: string } } | null }

  if (!review) return { error: 'Review not found' }

  const { error } = await supabase
    .from('reviews')
    .update({ status })
    .eq('id', reviewId)

  if (error) return { error: error.message }

  revalidatePath('/admin/reviews')
  revalidatePath(`/chalets/${review.listings.slug}`)
  return { error: null, success: true }
}

export async function deleteReviewAction(
  reviewId: string,
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = (await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()) as { data: { role: string } | null }

  if (!profile || profile.role !== 'admin') return { error: 'Admin access required' }

  // Fetch listing slug for revalidation before deleting
  const { data: review } = (await supabase
    .from('reviews')
    .select('listing_id, listings(slug)')
    .eq('id', reviewId)
    .single()) as { data: { listing_id: string; listings: { slug: string } } | null }

  if (!review) return { error: 'Review not found' }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)

  if (error) return { error: error.message }

  revalidatePath('/admin/reviews')
  revalidatePath(`/chalets/${review.listings.slug}`)
  return { error: null, success: true }
}
