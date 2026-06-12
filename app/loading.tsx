/**
 * Homepage loading skeleton — shown instantly while server data loads.
 */

import Link from "next/link";
import { Container, Icon } from "@/components/ui";
import { SITE } from "@/lib/constants";

export default function HomeLoading() {
  return (
    <div>
      {/* Header placeholder */}
      <div className="sticky top-0 z-50 header-surface border-b border-[var(--border-light)]">
        <Container>
          <div className="flex h-[var(--header-height)] items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center">
                <Icon name="home" size={18} stroke="white" fill="none" />
              </div>
              <span
                className="text-xl font-semibold tracking-tight text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {SITE.name}
              </span>
            </Link>
            <div className="w-64 h-12 rounded-full shimmer hidden md:block" />
            <div className="w-20 h-10 rounded-full shimmer" />
          </div>
        </Container>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-b from-[#fdf6f0] to-white">
        <Container className="py-12 md:py-20">
          <div className="w-80 h-14 rounded shimmer mb-3" />
          <div className="w-72 h-14 rounded shimmer mb-5" />
          <div className="w-64 h-5 rounded shimmer mb-2" />
          <div className="w-48 h-5 rounded shimmer" />
        </Container>
      </div>

      {/* Listing cards */}
      <Container className="py-8 md:py-12">
        <div className="w-56 h-7 rounded shimmer mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="aspect-[20/19] rounded-xl shimmer mb-3" />
              <div className="w-40 h-4 rounded shimmer mb-2" />
              <div className="w-28 h-3 rounded shimmer mb-2" />
              <div className="w-20 h-4 rounded shimmer mt-2" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
