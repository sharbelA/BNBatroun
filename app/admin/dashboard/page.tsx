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

  const totalChalets = listings.length
  const activeHosts = hosts.length
  const activeListings = listings.filter((l) => l.is_active).length

  const recentChalets = listings.slice(0, 5)
  const recentHosts = hosts.slice(0, 5)

  return (
    <div className="flex flex-col gap-10">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-warm-900">Overview</h1>
        <Link
          href="/admin/listings/new"
          style={{ backgroundColor: 'var(--accent)' }}
          className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-white transition hover:opacity-90"
        >
          + New chalet
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total chalets', value: totalChalets },
          { label: 'Active hosts', value: activeHosts },
          { label: 'Active listings', value: activeListings },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-sand-200 bg-white px-6 py-5"
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
            Recent chalets
          </h2>
          <Link
            href="/admin/listings"
            className="text-sm font-medium text-sea-600 hover:underline underline-offset-4"
          >
            View all
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-sand-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-sand-200 bg-sand-50 text-left">
              <tr>
                {['Title', 'Host', 'Price / night', 'Status'].map((h) => (
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
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-warm-400"
                  >
                    No chalets yet.
                  </td>
                </tr>
              ) : (
                recentChalets.map((listing) => (
                  <tr key={listing.id} className="border-b border-sand-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-warm-900">
                      {listing.title}
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
        <div className="overflow-hidden rounded-xl border border-sand-200 bg-white">
          <table className="w-full text-sm">
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
