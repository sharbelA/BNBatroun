/**
 * Hero — homepage hero with headline and region filters.
 * Composes Container + RegionPills.
 */

import { Container } from "@/components/ui";
import RegionPills from "./RegionPills";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fdf6f0] to-white">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[var(--accent)] opacity-[0.04]" />
        <div className="absolute top-32 -left-16 w-64 h-64 rounded-full bg-[var(--accent)] opacity-[0.03]" />
      </div>

      <Container className="relative py-12 md:py-20">
        <div className="max-w-2xl">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]"
            style={{ fontFamily: "var(--font-heading), Georgia, serif" }}
          >
            Your home away
            <br />
            from home in{" "}
            <span className="text-[var(--accent)]">Lebanon</span>
          </h1>
          <p className="mt-5 text-lg text-[var(--muted)] max-w-md leading-relaxed">
            Discover handpicked chalets, villas, and vacation homes — from
            coastal Batroun to the mountain peaks.
          </p>
        </div>

        <div className="mt-10">
          <RegionPills />
        </div>
      </Container>
    </section>
  );
}
