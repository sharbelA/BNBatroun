import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Manzeli connects travelers with handpicked chalets in Batroun, Lebanon.',
}

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 md:px-6 md:py-24">

      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-warm-900">
          About Manzeli
        </h1>
        <p className="mx-auto max-w-xl text-lg leading-relaxed text-warm-600">
          A curated collection of chalets in Batroun, Lebanon — where the
          mountains meet the Mediterranean.
        </p>
      </section>

      {/* Story */}
      <section className="mb-14 flex flex-col gap-5">
        <h2 className="text-xl font-semibold text-warm-900">Our story</h2>
        <p className="leading-relaxed text-warm-600">
          Manzeli (منزلي — "my home" in Arabic) was built to connect travelers
          with the best chalets in Batroun, North Lebanon. Every property is
          hand-selected and verified to ensure an authentic, comfortable stay.
        </p>
        <p className="leading-relaxed text-warm-600">
          Booking is simple and personal — all inquiries go directly to the
          host via WhatsApp, keeping things human and fast.
        </p>
      </section>

      {/* Batroun */}
      <section className="mb-14 flex flex-col gap-5">
        <h2 className="text-xl font-semibold text-warm-900">
          Why Batroun?
        </h2>
        <p className="leading-relaxed text-warm-600">
          One of the oldest cities in the world, Batroun sits on a rocky
          peninsula jutting into the Mediterranean. It is famous for its
          crystal-clear sea, Phoenician sea wall, vibrant restaurant scene,
          and welcoming mountain villages just minutes from the coast.
        </p>
        <p className="leading-relaxed text-warm-600">
          Whether you want a sea-view villa, a stone chalet in the pine
          forests, or a poolside retreat, Batroun has it all — and Manzeli
          helps you find it.
        </p>
      </section>

      {/* Host CTA */}
      <section className="rounded-2xl bg-sea-600 px-8 py-10 text-center text-white">
        <h2 className="mb-2 text-xl font-semibold">Own a chalet in Batroun?</h2>
        <p className="mb-6 text-sea-100">
          List it on Manzeli and reach guests looking for exactly what you
          offer.
        </p>
        <Link
          href="/list-your-chalet"
          className="inline-flex h-11 items-center rounded-xl bg-white px-6 text-sm font-semibold text-sea-700 transition hover:bg-sand-100"
        >
          List your chalet
        </Link>
      </section>

    </main>
  )
}
