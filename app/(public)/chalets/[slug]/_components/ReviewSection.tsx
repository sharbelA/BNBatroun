import Link from 'next/link'
import { getCurrentUser } from '@/app/_actions/auth'
import { getApprovedReviews } from '@/lib/supabase/queries/reviews'
import ReviewForm from './ReviewForm'

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  return (
    <span className={`flex gap-0.5 ${size === 'md' ? 'text-base' : 'text-sm'}`}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={n <= rating ? 'text-amber-400' : 'text-sand-200'}>
          ★
        </span>
      ))}
    </span>
  )
}

export default async function ReviewSection({
  listingId,
  listingSlug,
}: {
  listingId: string
  listingSlug: string
}) {
  const [user, reviews] = await Promise.all([
    getCurrentUser(),
    getApprovedReviews(listingId),
  ])

  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null

  return (
    <section>
      <div className="flex items-baseline gap-3 mb-5">
        <h2 className="text-xl font-semibold section-title">Reviews</h2>
        {avg !== null && (
          <span className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
            <span className="text-amber-400">★</span>
            <span>{avg.toFixed(1)}</span>
            <span>({reviews.length})</span>
          </span>
        )}
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(review => (
            <div
              key={review.id}
              className="rounded-xl border border-[var(--border-light)] bg-white p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{review.guest_name}</p>
                  <Stars rating={review.rating} />
                </div>
                <time className="text-xs text-[var(--muted)] shrink-0 mt-0.5">
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </time>
              </div>
              {review.comment && (
                <p className="mt-2 text-sm text-[var(--foreground)] leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          No reviews yet. Be the first to share your experience!
        </p>
      )}

      <div className="mt-6">
        {!user ? (
          <p className="text-sm text-[var(--muted)]">
            <Link
              href={`/login?redirect=${encodeURIComponent(`/chalets/${listingSlug}`)}`}
              className="font-medium text-[var(--accent)] hover:underline"
            >
              Sign in
            </Link>{' '}
            to write a review.
          </p>
        ) : user.role === 'guest' ? (
          <ReviewForm
            listingId={listingId}
            listingSlug={listingSlug}
            guestName={user.name}
          />
        ) : null}
      </div>
    </section>
  )
}
