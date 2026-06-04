import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'List your chalet',
  description:
    'Earn income from your Batroun chalet by listing it on Manzeli.',
}

const BENEFITS = [
  {
    title: 'Direct WhatsApp bookings',
    body: 'Guests contact you directly — no middlemen, no platform fees on each booking.',
  },
  {
    title: 'Full control',
    body: 'Set your own prices, block dates when you need to, and manage your availability calendar.',
  },
  {
    title: 'Beautiful listing page',
    body: 'Professional photos, detailed amenities, and an instant-view availability calendar.',
  },
  {
    title: 'Local focus',
    body: 'Manzeli is built for Batroun. Every guest who visits is looking for exactly what you offer.',
  },
]

const STEPS = [
  { n: '01', title: 'Create your host account', body: 'Sign up with your email.' },
  { n: '02', title: 'Add your chalet',          body: 'Fill in the details, upload photos, set your price.' },
  { n: '03', title: 'Start receiving inquiries', body: 'Guests find you and message via WhatsApp.' },
]

export default function ListYourChaletPage() {
  return (
    <main>

      {/* ── Hero ─────────────────────────────────── */}
      <section className="bg-sea-700 px-4 py-20 text-center text-white md:py-28">
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          List your chalet on Manzeli
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg text-sea-100">
          Reach guests looking for exactly what Batroun offers — and keep full
          control of your bookings.
        </p>
        <Link
          href="/host/login"
          className="inline-flex h-12 items-center rounded-xl bg-white px-8 text-sm font-semibold text-sea-700 transition hover:bg-sand-100 active:scale-[0.98]"
        >
          Get started — it's free
        </Link>
      </section>

      {/* ── Benefits ─────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-20 md:px-6">
        <h2 className="mb-10 text-center text-2xl font-semibold text-warm-900">
          Why list with Manzeli?
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {BENEFITS.map(({ title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-sand-200 bg-white p-6"
            >
              <h3 className="mb-2 font-semibold text-warm-900">{title}</h3>
              <p className="text-sm leading-relaxed text-warm-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────── */}
      <section className="bg-sand-50 px-4 py-20 md:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-semibold text-warm-900">
            How it works
          </h2>
          <ol className="flex flex-col gap-8">
            {STEPS.map(({ n, title, body }) => (
              <li key={n} className="flex gap-6">
                <span className="shrink-0 text-3xl font-bold text-sand-300">
                  {n}
                </span>
                <div>
                  <h3 className="mb-1 font-semibold text-warm-900">{title}</h3>
                  <p className="text-sm leading-relaxed text-warm-600">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────── */}
      <section className="px-4 py-20 text-center md:px-6">
        <h2 className="mb-3 text-2xl font-semibold text-warm-900">
          Ready to get started?
        </h2>
        <p className="mb-8 text-warm-600">
          Create your host account and list your first chalet in minutes.
        </p>
        <Link
          href="/host/login"
          className="inline-flex h-12 items-center rounded-xl bg-sea-600 px-8 text-sm font-semibold text-white transition hover:bg-sea-700 active:scale-[0.98]"
        >
          Create host account
        </Link>
      </section>

    </main>
  )
}
