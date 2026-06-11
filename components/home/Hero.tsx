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
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[var(--accent)] opacity-[0.06]" />
        <div className="absolute top-32 -left-16 w-64 h-64 rounded-full bg-[var(--accent)] opacity-[0.04]" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-amber-300 opacity-[0.04]" />
      </div>

      <Container className="relative py-14 md:py-24">
        <div className="max-w-2xl animate-page-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-xs font-semibold mb-6 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            Batroun, Lebanon
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]"
            style={{ fontFamily: "var(--font-heading), Georgia, serif" }}
          >
            Your home away
            <br />
            from home in{" "}
            <span className="text-[var(--accent)]">Lebanon</span>
          </h1>
          <p className="mt-5 text-lg text-warm-500 max-w-md leading-relaxed">
            Discover handpicked chalets and villas on the Batroun coast —
            your perfect getaway is one click away.
          </p>
        </div>

        <div className="mt-10">
          <RegionPills />
        </div>
      </Container>
    </section>
  );
}
