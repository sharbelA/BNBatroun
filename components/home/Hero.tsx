/**
 * Hero — homepage hero with headline and region filters.
 * Composes Container + RegionPills.
 */

import { Container } from "@/components/ui";
import RegionPills from "./RegionPills";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#fdf6f0] via-[#fef9f5] to-white">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[var(--accent)] opacity-[0.05]" />
        <div className="absolute top-32 -left-16 w-64 h-64 rounded-full bg-[var(--accent)] opacity-[0.04]" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-amber-300 opacity-[0.03]" />
      </div>

      <Container className="relative py-20 md:py-32">
        <div className="max-w-2xl animate-page-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-xs font-semibold mb-7 tracking-[0.15em] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            Batroun, Lebanon
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05]">
            Your Home Away
            <br />
            From Home In{" "}
            <span className="text-[var(--accent)]">Lebanon</span>
          </h1>
          <p className="mt-6 text-lg text-warm-500 max-w-md leading-relaxed">
            Discover handpicked chalets and villas on the Batroun coast.
            Your perfect getaway is one click away.
          </p>
        </div>

        <div className="mt-12">
          <RegionPills />
        </div>
      </Container>
    </section>
  );
}
