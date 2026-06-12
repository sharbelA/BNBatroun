import type { Metadata } from 'next'
import Link from 'next/link'
import { Header, Footer } from '@/components/layout'
import { Container } from '@/components/ui'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Manzeli connects travelers with handpicked chalets in Batroun, Lebanon.',
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-gradient-to-br from-[#fdf6f0] via-white to-[var(--accent-light)] py-24 md:py-32">
          <Container className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-xs font-semibold mb-7 tracking-[0.15em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              Since 2025
            </div>
            <h1 className="mb-5 text-4xl md:text-6xl tracking-tight text-warm-900 animate-page-in">
              About Manzeli
            </h1>
            <p className="mx-auto max-w-xl text-lg leading-relaxed text-warm-500">
              A curated collection of chalets in Batroun, Lebanon — where the
              mountains meet the Mediterranean.
            </p>
          </Container>
        </section>

        {/* Story */}
        <section className="py-20 md:py-28">
          <Container>
            <div className="mx-auto max-w-2xl">
              <h2 className="text-2xl md:text-3xl text-warm-900 mb-6 section-title">Our story</h2>
              <p className="leading-relaxed text-warm-600 mb-4">
                Manzeli (منزلي — &quot;my home&quot; in Arabic) was built to connect travelers
                with the best chalets in Batroun, North Lebanon. Every property is
                hand-selected and verified to ensure an authentic, comfortable stay.
              </p>
              <p className="leading-relaxed text-warm-600">
                Booking is simple and personal — all inquiries go directly to the
                host via WhatsApp, keeping things human and fast.
              </p>
            </div>
          </Container>
        </section>

        {/* Why Batroun — dark section */}
        <section className="bg-warm-900 text-white py-20 md:py-28">
          <Container>
            <div className="mx-auto max-w-2xl">
              <h2 className="text-2xl md:text-3xl text-white mb-6">
                Why Batroun?
              </h2>
              <p className="leading-relaxed text-warm-300 mb-4">
                One of the oldest cities in the world, Batroun sits on a rocky
                peninsula jutting into the Mediterranean. It is famous for its
                crystal-clear sea, Phoenician sea wall, vibrant restaurant scene,
                and welcoming mountain villages just minutes from the coast.
              </p>
              <p className="leading-relaxed text-warm-300">
                Whether you want a sea-view villa, a stone chalet in the pine
                forests, or a poolside retreat, Batroun has it all — and Manzeli
                helps you find it.
              </p>
            </div>
          </Container>
        </section>

        {/* Values */}
        <section className="bg-sand-50 py-20 md:py-28">
          <Container>
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl md:text-3xl text-warm-900 mb-14 text-center" style={{ display: 'block', textAlign: 'center' }}>What makes us different</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  { icon: '✋', title: 'Handpicked', desc: 'Every chalet is personally visited and verified before listing.' },
                  { icon: '💬', title: 'WhatsApp-first', desc: 'Book directly with hosts — no middlemen, no hidden fees.' },
                  { icon: '📍', title: 'Batroun experts', desc: 'Local knowledge baked in — we know every beach, trail, and restaurant.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="text-center">
                    <div className="text-3xl mb-4">{icon}</div>
                    <h3 className="text-lg text-warm-900 mb-2">{title}</h3>
                    <p className="text-sm text-warm-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Host CTA */}
        <section className="py-20 md:py-28">
          <Container>
            <div className="mx-auto max-w-2xl rounded-2xl bg-[var(--accent)] px-8 py-14 text-center text-white">
              <h2 className="mb-3 text-2xl md:text-3xl text-white">Own a chalet in Batroun?</h2>
              <p className="mb-7 text-white/80">
                List it on Manzeli and reach guests looking for exactly what you
                offer.
              </p>
              <Link
                href="/list-your-chalet"
                className="inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-semibold text-[var(--accent)] transition-colors duration-200 hover:bg-sand-50"
              >
                List your chalet →
              </Link>
            </div>
          </Container>
        </section>

      </main>
      <Footer />
    </>
  )
}
