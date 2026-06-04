import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateMetadata(
  props: PageProps<'/chalets/[slug]'>
): Promise<Metadata> {
  const { slug } = await props.params
  return { title: slug.replace(/-/g, ' ') }
}

export default async function ChaletDetailPage(
  props: PageProps<'/chalets/[slug]'>
) {
  const { slug } = await props.params

  // TODO: fetch chalet from Supabase by slug; call notFound() if missing
  if (!slug) notFound()

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 md:px-6 md:py-16">
      {/* Image gallery placeholder */}
      <div className="mb-8 h-72 w-full rounded-2xl bg-sand-100 md:h-96" />

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Details */}
        <div className="flex-1">
          <h1 className="mb-2 text-3xl font-semibold capitalize text-warm-900">
            {slug.replace(/-/g, ' ')}
          </h1>
          <p className="mb-6 text-warm-500">Batroun · N beds · N baths</p>
          <p className="text-warm-600">Chalet description will appear here.</p>
        </div>

        {/* Booking card */}
        <aside className="w-full lg:w-80">
          <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
            <p className="mb-4 text-2xl font-semibold text-warm-900">
              $— / night
            </p>
            <button className="h-11 w-full rounded-xl bg-sea-600 text-sm font-semibold text-white transition hover:bg-sea-700 active:scale-[0.98]">
              Check availability
            </button>
          </div>
        </aside>
      </div>
    </main>
  )
}
