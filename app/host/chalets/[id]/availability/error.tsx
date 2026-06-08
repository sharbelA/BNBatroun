"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function HostAvailabilityError({
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
    <main className="mx-auto w-full max-w-3xl px-4 py-24 text-center">
      <h1 className="mb-2 text-xl font-semibold text-warm-900">
        Something went wrong
      </h1>
      <p className="mb-6 text-sm text-warm-500">
        We couldn&apos;t load this calendar. Please try again.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="h-10 rounded-lg bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/host/dashboard"
          className="inline-flex h-10 items-center rounded-lg border border-sand-200 px-6 text-sm font-medium text-warm-700 transition hover:bg-sand-50"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
