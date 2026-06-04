import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Chalets' }

export default function AdminListingsPage() {
  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-warm-900">All chalets</h1>
        <Link
          href="/admin/listings/new"
          className="inline-flex h-9 items-center rounded-lg bg-sea-600 px-4 text-sm font-medium text-white transition hover:bg-sea-700"
        >
          + New chalet
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="h-9 rounded-lg border border-sand-200 bg-white px-3 text-sm text-warm-700 outline-none focus:border-sea-400">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select className="h-9 rounded-lg border border-sand-200 bg-white px-3 text-sm text-warm-700 outline-none focus:border-sea-400">
          <option value="">All hosts</option>
        </select>
        <input
          type="text"
          placeholder="Search by title…"
          className="h-9 rounded-lg border border-sand-200 bg-white px-3 text-sm text-warm-900 placeholder:text-warm-400 outline-none focus:border-sea-400 focus:ring-2 focus:ring-sea-100 w-56"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-sand-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-sand-200 bg-sand-50 text-left">
            <tr>
              {['Title', 'Host', 'Location', 'Price / night', 'Status', 'Featured'].map(
                (h) => (
                  <th key={h} className="px-4 py-3 font-medium text-warm-600">
                    {h}
                  </th>
                ),
              )}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            <tr>
              <td
                colSpan={7}
                className="px-4 py-12 text-center text-sm text-warm-400"
              >
                No chalets found.
              </td>
            </tr>
            {/* Rows rendered here once data is wired up. Example row shape:
            <tr className="hover:bg-sand-50 transition-colors">
              <td className="px-4 py-3 font-medium text-warm-900">{title}</td>
              <td className="px-4 py-3 text-warm-600">{host.name}</td>
              <td className="px-4 py-3 text-warm-600">{location}</td>
              <td className="px-4 py-3 text-warm-900">${price}</td>
              <td className="px-4 py-3">
                <span className={is_active ? 'text-emerald-700' : 'text-warm-400'}>
                  {is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3">{is_featured ? '★' : '—'}</td>
              <td className="px-4 py-3">
                <div className="flex gap-3">
                  <Link href={`/admin/listings/${id}/edit`} className="text-sea-600 hover:underline">Edit</Link>
                  <Link href={`/admin/listings/${id}/photos`} className="text-sea-600 hover:underline">Photos</Link>
                </div>
              </td>
            </tr>
            */}
          </tbody>
        </table>
      </div>

    </div>
  )
}
