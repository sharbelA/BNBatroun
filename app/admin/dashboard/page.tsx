import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Admin dashboard' }

const STATS = [
  { label: 'Total chalets', value: '—' },
  { label: 'Active hosts', value: '—' },
  { label: 'Active listings', value: '—' },
]

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-10">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-warm-900">Overview</h1>
        <Link
          href="/admin/listings/new"
          className="inline-flex h-9 items-center rounded-lg bg-sea-600 px-4 text-sm font-medium text-white transition hover:bg-sea-700"
        >
          + New chalet
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map(({ label, value }) => (
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
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-warm-400"
                >
                  No chalets yet.
                </td>
              </tr>
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
                {['Name', 'Phone / WhatsApp', 'Joined'].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium text-warm-600">
                    {h}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-sm text-warm-400"
                >
                  No hosts yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}
