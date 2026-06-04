import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Manzeli — Vacation Rentals",
  description: "Discover and book unique vacation rentals.",
};

export default function HomePage() {
  return (
    <main className="flex flex-col flex-1">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-6 px-6 py-32 text-center bg-zinc-50">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900">
          Find your perfect getaway
        </h1>
        <p className="max-w-xl text-lg text-zinc-600">
          Browse handpicked vacation rentals — from beachfront villas to
          mountain retreats.
        </p>
        <Link
          href="/listings"
          className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Browse listings
        </Link>
      </section>

      {/* Featured placeholder */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <h2 className="mb-8 text-2xl font-semibold text-zinc-900">
          Featured rentals
        </h2>
        <p className="text-zinc-500">Featured listings will appear here.</p>
      </section>
    </main>
  );
}
