import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Browse chalets' }

export default async function ChaletsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const filters = await searchParams

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="mb-8 text-3xl font-semibold text-warm-900">
        Chalets in Batroun
      </h1>

      {/* Filters */}
      <div className="mb-10 flex flex-wrap gap-3">
        <select className="h-9 rounded-lg border border-sand-200 bg-white px-3 text-sm text-warm-700">
          <option value="">Any location</option>
        </select>
        <select className="h-9 rounded-lg border border-sand-200 bg-white px-3 text-sm text-warm-700">
          <option value="">Any guests</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <p className="col-span-full text-sm text-warm-400">
          Chalet cards will appear here.
        </p>
      </div>

      {process.env.NODE_ENV === 'development' && Object.keys(filters).length > 0 && (
        <pre className="mt-8 rounded-lg bg-sand-100 p-4 text-xs text-warm-700">
          {JSON.stringify(filters, null, 2)}
        </pre>
      )}
    </main>
  )
}
