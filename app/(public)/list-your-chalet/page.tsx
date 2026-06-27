import type { Metadata } from "next";
import { Header, Footer } from "@/components/layout";
import { Container } from "@/components/ui";

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const WA_LINK = WA
  ? "https://wa.me/" + WA + "?text=" + encodeURIComponent("Hi! I'd like to list my chalet on BNBatroun.")
  : "#";

export const metadata: Metadata = {
  title: "List your chalet",
  description: "Earn income from your Batroun chalet by listing it on BNBatroun.",
};

const BENEFITS = [
  { title: "Direct WhatsApp bookings", body: "Guests contact you directly — no middlemen, no platform fees on each booking." },
  { title: "Full control", body: "Set your own prices, block dates when you need to, and manage your availability calendar." },
  { title: "Beautiful listing page", body: "Professional photos, detailed amenities, and an instant-view availability calendar." },
  { title: "Local focus", body: "BNBatroun is built for Batroun. Every guest who visits is looking for exactly what you offer." },
];

const STEPS = [
  { n: "01", title: "Message us on WhatsApp", body: "Tell us about your property — location, size, what makes it special." },
  { n: "02", title: "Send us your photos and details", body: "Share photos, pricing, house rules, and amenities. We handle the rest." },
  { n: "03", title: "We create your listing and host account", body: "Your chalet goes live. We give you a login to manage your availability calendar." },
];

export default function ListYourChaletPage() {
  return (
    <>
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[var(--accent)] py-24 md:py-32 text-white text-center">
          <Container>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-white text-xs font-semibold mb-7 tracking-[0.15em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              For hosts
            </div>
            <h1 className="mb-5 text-4xl md:text-6xl tracking-tight leading-[1.05] animate-page-in">
              List your chalet on BNBatroun
            </h1>
            <p className="mx-auto mb-9 max-w-xl text-lg text-white/85 leading-relaxed">
              Reach guests looking for exactly what Batroun offers — and keep full control of your bookings.
            </p>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center rounded-full bg-white px-8 text-sm font-semibold text-[var(--accent)] transition-colors duration-200 hover:bg-sand-50"
            >
              Contact us on WhatsApp
            </a>
          </Container>
        </section>

        {/* Benefits */}
        <section className="py-20 md:py-28">
          <Container>
            <h2 className="mb-14 text-center text-2xl md:text-3xl tracking-tight text-warm-900">
              Why list with BNBatroun?
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-5xl mx-auto">
              {BENEFITS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[var(--border-light)] bg-white p-7 transition-shadow duration-200 hover:shadow-[var(--card-shadow)]"
                >
                  <h3 className="mb-2 text-lg text-warm-900">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--muted)]">{item.body}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* How it works */}
        <section className="bg-[var(--surface)] py-20 md:py-28">
          <Container>
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-14 text-center text-2xl md:text-3xl tracking-tight text-warm-900">
                How it works
              </h2>
              <ol className="flex flex-col gap-10">
                {STEPS.map((step) => (
                  <li key={step.n} className="flex gap-6">
                    <span
                      className="shrink-0 text-3xl font-light opacity-40 text-[var(--accent)]"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {step.n}
                    </span>
                    <div>
                      <h3 className="mb-1.5 text-lg text-warm-900">{step.title}</h3>
                      <p className="text-sm leading-relaxed text-[var(--muted)]">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Container>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28 text-center">
          <Container>
            <div className="mx-auto max-w-2xl rounded-2xl bg-[var(--accent)] px-8 py-14 text-white">
              <h2 className="mb-3 text-2xl md:text-3xl text-white">Ready to get started?</h2>
              <p className="mb-8 text-white/80">
                {"Send us a message and we'll take care of the rest."}
              </p>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center rounded-full bg-white px-8 text-sm font-semibold text-[var(--accent)] transition-colors duration-200 hover:bg-sand-50"
              >
                Contact us on WhatsApp
              </a>
            </div>
          </Container>
        </section>

      </main>
      <Footer />
    </>
  );
}
