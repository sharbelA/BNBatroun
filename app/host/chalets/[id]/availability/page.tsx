import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Manage availability' }

const STATUS_LEGEND = [
  { label: 'Available',  color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { label: 'Booked',     color: 'bg-red-100     text-red-700     border-red-200' },
  { label: 'Blocked',    color: 'bg-sand-200    text-warm-600    border-sand-300' },
]

export default async function HostAvailabilityPage(
  props: PageProps<'/host/chalets/[id]/availability'>,
) {
  const { id } = await props.params

  // TODO: fetch chalet + its availability rows for the next 3 months
  // const supabase = await createClient()
  // const { data: chalet } = await supabase
  //   .from('listings').select('title, host_id').eq('id', id).single()
  // const { data: slots } = await supabase
  //   .from('availability').select('date, status, note').eq('listing_id', id)

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 md:px-6 md:py-16">

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/host/dashboard"
          className="text-sm text-warm-500 hover:text-warm-900 transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      <h1 className="mb-1 text-2xl font-semibold text-warm-900">
        Availability calendar
      </h1>
      <p className="mb-8 text-sm text-warm-500">
        Mark dates as blocked to prevent bookings, or unblock them when
        you&apos;re ready.
      </p>

      {/* Status legend */}
      <div className="mb-8 flex flex-wrap gap-2">
        {STATUS_LEGEND.map(({ label, color }) => (
          <span
            key={label}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${color}`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Calendar placeholder */}
      {/* TODO: replace with react-day-picker DayPicker component.
          - mode="multiple" for selecting ranges
          - modifiers={{ booked: bookedDates, blocked: blockedDates }}
          - onSelect triggers an optimistic UI update + Server Action upsert
            into the `availability` table
      */}
      <div className="mb-8 flex min-h-80 items-center justify-center rounded-2xl border border-sand-200 bg-white">
        <p className="text-sm text-warm-400">
          Calendar (react-day-picker) will render here.
        </p>
      </div>

      {/* Bulk actions */}
      <div className="flex flex-col gap-4 rounded-xl border border-sand-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-warm-900">
          Bulk actions
        </h2>

        <div className="flex flex-wrap gap-3">
          {/* TODO: wire to Server Action that upserts availability rows */}
          <button
            type="button"
            className="h-9 rounded-lg border border-sand-200 px-4 text-sm font-medium text-warm-700 transition hover:bg-sand-50"
          >
            Block selected dates
          </button>
          <button
            type="button"
            className="h-9 rounded-lg border border-sand-200 px-4 text-sm font-medium text-warm-700 transition hover:bg-sand-50"
          >
            Unblock selected dates
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="note"
            className="text-sm font-medium text-warm-700"
          >
            Note (optional)
          </label>
          <input
            id="note"
            type="text"
            placeholder="e.g. Personal stay, renovation…"
            className="h-10 rounded-xl border border-sand-200 bg-white px-4 text-sm text-warm-900 placeholder:text-warm-400 outline-none transition focus:border-sea-400 focus:ring-2 focus:ring-sea-100"
          />
        </div>

        <button
          type="button"
          className="h-10 w-full rounded-xl bg-sea-600 text-sm font-semibold text-white transition hover:bg-sea-700 active:scale-[0.98] sm:w-auto sm:px-8"
        >
          Save changes
        </button>
      </div>

    </main>
  )
}
