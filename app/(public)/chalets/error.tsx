"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Container } from "@/components/ui";

export default function ChaletsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center">
        <Container className="py-24 text-center">
          <p className="text-5xl mb-4">😔</p>
          <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-[var(--muted)] mb-8 max-w-sm mx-auto">
            We couldn&apos;t load chalets right now. Please try again.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 border border-[var(--border)] hover:bg-[var(--surface)] rounded-xl text-sm font-semibold transition-colors"
            >
              Back home
            </Link>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
