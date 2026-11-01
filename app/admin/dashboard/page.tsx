import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminListings } from '@/lib/supabase/queries/admin'
import { getHostsWithListingCounts } from '@/lib/supabase/queries/admin'
import { format } from 'date-fns'

export const metadata: Metadata = { title: 'Admin dashboard' }

export default async function AdminDashboardPage() {
  const [listings, hosts] = await Promise.all([
    getAdminListings(),
    getHostsWithListingCounts(),
  ])

  const typeOf = (l: (typeof listings)[number]) => l.listing_type ?? 'daily'
  const totalChalets = listings.filter((l) => typeOf(l) === 'daily').length
  const totalSeasonal = listings.filter((l) => typeOf(l) === 'seasonal').length
  const totalForSale = listings.filter((l) => typeOf(l) === 'sale').length
  const activeHosts = hosts.length
  const activeListings = listings.filter((l) => l.is_active).length

  const recentChalets = listings.slice(0, 5)
  const recentHosts = hosts.slice(0, 5)

  return (
    <div className="flex flex-col gap-10">

      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-warm-900">Overview</h1>
        <div className="flex flex-wrap gap-2">
          {[
            { type: 'daily', label: '+ New chalet' },
            { type: 'seasonal', label: '+ New seasonal rental' },
            { type: 'sale', label: '+ New property for sale' },
          ].map(({ type, label }) => (
            <Link
              key={type}
              href={`/admin/listings/new?type=${type}`}
              style={type === 'daily' ? { backgroundColor: 'var(--accent)' } : undefined}
              className={`inline-flex h-11 md:h-9 items-center rounded-lg px-4 text-sm font-medium transition hover:opacity-90 ${
                type === 'daily'
                  ? 'text-white'
                  : 'border border-sand-200 bg-white text-warm-700 hover:bg-sand-50'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Daily chalets', value: totalChalets },
          { label: 'Seasonal rentals', value: totalSeasonal },
          { label: 'Properties for sale', value: totalForSale },
          { label: 'Active hosts', value: activeHosts },
          { label: 'Active listings', value: activeListings },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-sand-200 bg-white px-4 py-4 sm:px-6 sm:py-5"
          >
            <p className="text-sm text-warm-500">{label}</p>
            <p className="mt-1 text-3xl font-semibold text-warm-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent chalets */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-warm-900">
            Recent listings
          </h2>
          <Link
            href="/admin/listings"
            className="text-sm font-medium text-sea-600 hover:underline underline-offset-4"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto rounded-xl border border-sand-200 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-sand-200 bg-sand-50 text-left">
              <tr>
                {['Title', 'Type', 'Host', 'Price', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium text-warm-600">
                    {h}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {recentChalets.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-warm-400"
                  >
                    No listings yet.
                  </td>
                </tr>
              ) : (
                recentChalets.map((listing) => (
                  <tr key={listing.id} className="border-b border-sand-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-warm-900">
                      {listing.title}
                    </td>
                    <td className="px-4 py-3 text-warm-500">
                      {listing.listing_type === 'sale' ? 'For sale' : listing.listing_type === 'seasonal' ? 'Seasonal' : 'Daily'}
                    </td>
                    <td className="px-4 py-3 text-warm-500">
                      {listing.host_name}
                    </td>
                    <td className="px-4 py-3 text-warm-700">
                      ${listing.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: listing.is_active ? '#dcfce7' : '#f3f4f6',
                          color: listing.is_active ? '#15803d' : '#6b7280',
                        }}
                      >
                        {listing.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/listings/${listing.id}/edit`}
                        className="text-sea-600 hover:underline text-xs"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent hosts */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-warm-900">
            Recent hosts
          </h2>
          <Link
            href="/admin/hosts"
            className="text-sm font-medium text-sea-600 hover:underline underline-offset-4"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto rounded-xl border border-sand-200 bg-white">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="border-b border-sand-200 bg-sand-50 text-left">
              <tr>
                {['Name', 'Phone / WhatsApp', 'Chalets', 'Joined'].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium text-warm-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentHosts.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-sm text-warm-400"
                  >
                    No hosts yet.
                  </td>
                </tr>
              ) : (
                recentHosts.map((host) => (
                  <tr key={host.id} className="border-b border-sand-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-warm-900">
                      {host.name}
                    </td>
                    <td className="px-4 py-3 text-warm-500">
                      {host.phone || '—'}
                    </td>
                    <td className="px-4 py-3 text-warm-700">
                      {host.listing_count}
                    </td>
                    <td className="px-4 py-3 text-warm-500 text-xs">
                      {format(new Date(host.created_at), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}
