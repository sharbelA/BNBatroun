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
    <main className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 md:py-16">

      {/* Breadcrumb */}
      <div className="mb-8">
        <Link
          href="/host/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-warm-900 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12L6 8L10 4"/></svg>
          Back to dashboard
        </Link>
      </div>

      {/* Page header */}
      <div
        style={{
          marginBottom: '32px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-light, #ebebeb)',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--foreground)',
            marginBottom: '6px',
          }}
        >
          {listing.title}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
          Manage your chalet&apos;s availability calendar
        </p>
      </div>

      <AvailabilityCalendar
        listingId={listing.id}
        initialAvailability={availability}
        mode="host"
      />

    </main>
  )
}
