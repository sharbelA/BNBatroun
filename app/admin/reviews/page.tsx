import Link from 'next/link'
import { getAllReviewsForAdmin } from '@/lib/supabase/queries/reviews'
import ReviewActions from './_components/ReviewActions'

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const status = typeof params.status === 'string' ? params.status : ''

  const reviews = await getAllReviewsForAdmin(status || undefined)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-900">Reviews</h1>
        <p className="mt-1 text-sm text-warm-500">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map(tab => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/reviews?status=${tab.value}` : '/admin/reviews'}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              status === tab.value
                ? 'bg-warm-800 text-white'
                : 'bg-white border border-sand-200 text-warm-600 hover:bg-sand-50'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-sand-200 bg-white px-8 py-12 text-center">
          <p className="text-warm-500">No reviews{status ? ` with status "${status}"` : ''} yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-sand-200 bg-white overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-sand-100 bg-sand-50 text-xs uppercase tracking-wide text-warm-500">
                <th className="px-4 py-3 text-left font-semibold">Chalet</th>
                <th className="px-4 py-3 text-left font-semibold">Guest</th>
                <th className="px-4 py-3 text-left font-semibold">Rating</th>
                <th className="px-4 py-3 text-left font-semibold">Comment</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(review => (
                <tr key={review.id} className="border-b border-sand-100 last:border-none hover:bg-sand-50 transition-colors">
                  <td className="px-4 py-4 font-medium text-warm-900 max-w-[140px] truncate">
                    {review.listings?.title ?? '—'}
                  </td>
                  <td className="px-4 py-4 text-warm-700">{review.guest_name}</td>
                  <td className="px-4 py-4">
                    <span className="flex gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map(n => (
                        <span key={n} className={n <= review.rating ? 'text-amber-400' : 'text-sand-200'}>
                          ★
                        </span>
                      ))}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-warm-600 max-w-[200px]">
                    <p className="truncate">{review.comment || '—'}</p>
                  </td>
                  <td className="px-4 py-4 text-warm-500 whitespace-nowrap">
                    {new Date(review.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-4">
                    <ReviewActions reviewId={review.id} currentStatus={review.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
