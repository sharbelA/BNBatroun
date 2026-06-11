'use client'

import { useState, useTransition } from 'react'
import { submitReviewAction } from '@/app/_actions/reviews'

interface Props {
  listingId: string
  listingSlug: string
  guestName: string
}

export default function ReviewForm({ listingId, listingSlug }: Props) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (rating === 0) { setError('Please select a rating'); return }
    setError(null)
    startTransition(async () => {
      const result = await submitReviewAction(listingId, listingSlug, rating, comment)
      if (result.error) {
        setError(result.error)
      } else {
        setRating(0)
        setComment('')
        setToast(true)
        setTimeout(() => setToast(false), 4000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold text-sm">Write a review</h3>

      {toast && (
        <p className="text-sm text-warm-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          Thanks! Your review is pending approval.
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          Your rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              className={`text-2xl leading-none transition-colors star-btn ${
                n <= (hovered || rating) ? 'text-amber-400' : 'text-sand-200'
              }`}
              aria-label={`${n} star${n !== 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="review-comment"
          className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
        >
          Your review
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={e => setComment(e.target.value)}
          disabled={isPending}
          rows={4}
          placeholder="Tell us about your stay…"
          className="w-full rounded-xl border border-[var(--border-light)] bg-white px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] disabled:opacity-50 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || rating === 0}
        className="h-10 rounded-xl bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
      >
        {isPending ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  )
}
