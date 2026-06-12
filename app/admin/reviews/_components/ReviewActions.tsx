'use client'

import { useTransition } from 'react'
import { moderateReviewAction } from '@/app/_actions/reviews'

interface Props {
  reviewId: string
  currentStatus: string
}

export default function ReviewActions({ reviewId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()

  function moderate(status: 'approved' | 'rejected') {
    startTransition(async () => {
      await moderateReviewAction(reviewId, status)
    })
  }

  if (currentStatus !== 'pending') {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          currentStatus === 'approved'
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}
      >
        {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => moderate('approved')}
        disabled={isPending}
        className="inline-flex min-h-11 items-center rounded-lg bg-green-600 px-3 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={() => moderate('rejected')}
        disabled={isPending}
        className="inline-flex min-h-11 items-center rounded-lg bg-red-600 px-3 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  )
}
