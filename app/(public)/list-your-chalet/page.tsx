import type { Metadata } from "next";
import { Header, Footer } from "@/components/layout";

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const WA_LINK = WA
  ? "https://wa.me/" + WA + "?text=" + encodeURIComponent("Hi! I'd like to list my chalet on Manzeli.")
  : "#";

export const metadata: Metadata = {
  title: "List your chalet",
  description: "Earn income from your Batroun chalet by listing it on Manzeli.",
};

const BENEFITS = [
  { title: "Direct WhatsApp bookings", body: "Guests contact you directly — no middlemen, no platform fees on each booking." },
  { title: "Full control", body: "Set your own prices, block dates when you need to, and manage your availability calendar." },
  { title: "Beautiful listing page", body: "Professional photos, detailed amenities, and an instant-view availability calendar." },
  { title: "Local focus", body: "Manzeli is built for Batroun. Every guest who visits is looking for exactly what you offer." },
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
      <main>
        <section className="px-4 py-24 text-center text-white md:py-32" style={{ backgroundColor: "var(--accent)" }}>
          <h1 className="mb-5 text-4xl tracking-tight md:text-6xl">
            List your chalet on Manzeli
          </h1>
          <p className="mx-auto mb-9 max-w-xl text-lg opacity-90 leading-relaxed">
            Reach guests looking for exactly what Batroun offers — and keep full control of your bookings.
          </p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center rounded-full bg-white px-8 text-sm font-semibold transition-colors duration-200 hover:bg-sand-50" style={{ color: "var(--accent)" }}>
            Contact us on WhatsApp
          </a>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-20 md:py-28 md:px-6">
          <h2 className="mb-14 text-center text-2xl md:text-3xl">Why list with Manzeli?</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {BENEFITS.map(function (item) {
              return (
                <div key={item.title} className="rounded-2xl border bg-white p-7 transition-shadow duration-200 hover:shadow-[var(--card-shadow)]" style={{ borderColor: "var(--border-light)" }}>
                  <h3 className="mb-2 text-lg">{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{item.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-4 py-20 md:py-28 md:px-6" style={{ backgroundColor: "var(--surface)" }}>
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-14 text-center text-2xl md:text-3xl">How it works</h2>
            <ol className="flex flex-col gap-10">
              {STEPS.map(function (step) {
                return (
                  <li key={step.n} className="flex gap-6">
                    <span className="shrink-0 text-3xl font-light opacity-40" style={{ color: "var(--accent)", fontFamily: "var(--font-heading)" }}>{step.n}</span>
                    <div>
                      <h3 className="mb-1.5 text-lg">{step.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{step.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="px-4 py-20 md:py-28 text-center md:px-6">
          <h2 className="mb-3 text-2xl md:text-3xl">Ready to get started?</h2>
          <p className="mb-8" style={{ color: "var(--muted)" }}>
            {"Send us a message and we'll take care of the rest."}
          </p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center rounded-full px-8 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--accent-hover)]" style={{ backgroundColor: "var(--accent)" }}>
            Contact us on WhatsApp
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}