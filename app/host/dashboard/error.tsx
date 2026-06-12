"use client";

import { useEffect } from "react";

export default function HostDashboardError({
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
    <main className="mx-auto w-full max-w-5xl px-4 py-24 text-center">
      <h1 className="mb-2 text-xl font-semibold text-warm-900">
        Something went wrong
      </h1>
      <p className="mb-6 text-sm text-warm-500">
        We couldn&apos;t load your chalets. Please try again.
      </p>
      <button
        onClick={reset}
        className="h-11 rounded-lg bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}
