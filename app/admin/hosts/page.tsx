import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Hosts' }

export default function AdminHostsPage() {
  return (
    <div className="flex flex-col gap-6">

      <h1 className="text-2xl font-semibold text-warm-900">Hosts</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or phone…"
          className="h-9 w-64 rounded-lg border border-sand-200 bg-white px-3 text-sm text-warm-900 placeholder:text-warm-400 outline-none focus:border-sea-400 focus:ring-2 focus:ring-sea-100"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-sand-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-sand-200 bg-sand-50 text-left">
            <tr>
              {['Name', 'Phone', 'WhatsApp', 'Chalets', 'Joined'].map((h) => (
                <th key={h} className="px-4 py-3 font-medium text-warm-600">
                  {h}
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            <tr>
              <td
                colSpan={6}
                className="px-4 py-12 text-center text-sm text-warm-400"
              >
                No hosts yet.
              </td>
            </tr>
            {/* Row shape once data is wired:
            <tr className="hover:bg-sand-50 transition-colors">
              <td className="px-4 py-3 font-medium text-warm-900">{name}</td>
              <td className="px-4 py-3 text-warm-600">{phone ?? '—'}</td>
              <td className="px-4 py-3 text-warm-600">{whatsapp ?? '—'}</td>
              <td className="px-4 py-3 text-warm-900">{listingCount}</td>
              <td className="px-4 py-3 text-warm-500">
                {new Date(created_at).toLocaleDateString('en-GB')}
              </td>
              <td className="px-4 py-3">
                <button className="text-sm font-medium text-red-500 hover:underline">
                  Remove
                </button>
              </td>
            </tr>
            */}
          </tbody>
        </table>
      </div>

    </div>
  )
}
