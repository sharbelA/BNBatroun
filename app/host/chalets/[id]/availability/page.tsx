import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/app/_actions/auth'
import { getAdminListingById } from '@/lib/supabase/queries/admin'
import { getListingAvailabilityWindow } from '@/lib/supabase/queries/listings'
import AvailabilityCalendar from '@/components/calendar/AvailabilityCalendar'

export const metadata: Metadata = { title: 'Manage availability' }

export default async function HostAvailabilityPage(
  props: PageProps<'/host/chalets/[id]/availability'>,
) {
  const { id } = await props.params
  const user = await getCurrentUser()
  if (!user) notFound()

  const listing = await getAdminListingById(id)
  if (!listing || listing.host_id !== user.id) notFound()

  const availability = await getListingAvailabilityWindow(id)

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
        {listing.title} — availability
      </h1>
      <p className="mb-8 text-sm text-warm-500">
        Click a date to toggle it between available and blocked, or click and
        drag to update a range of dates at once.
      </p>

      <AvailabilityCalendar
        listingId={listing.id}
        initialAvailability={availability}
        mode="host"
      />

    </main>
  )
}
