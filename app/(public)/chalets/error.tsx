"use client";

import { useEffect } from "react";
import Link from "next/link";

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
    <main className="flex-1 flex items-center justify-center min-h-screen">
      <div className="py-24 text-center px-4">
        <p className="text-5xl mb-4">😔</p>
        <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
        <p
          style={{ color: "var(--muted)", maxWidth: "320px", margin: "0 auto 32px" }}
          className="text-sm"
        >
          We couldn&apos;t load the chalets. Please try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            style={{
              backgroundColor: "var(--accent)",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 600,
              border: "1.5px solid var(--border)",
              textDecoration: "none",
              color: "var(--foreground)",
            }}
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
