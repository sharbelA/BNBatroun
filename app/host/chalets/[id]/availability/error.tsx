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
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "#fef2f2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h1
        style={{
          fontSize: "20px",
          fontWeight: 600,
          color: "var(--foreground)",
          marginBottom: "8px",
        }}
      >
        Something went wrong
      </h1>
      <p
        style={{
          fontSize: "14px",
          color: "var(--muted)",
          marginBottom: "24px",
        }}
      >
        We couldn&apos;t load this calendar. Please try again.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          style={{
            height: "42px",
            borderRadius: "12px",
            backgroundColor: "var(--accent)",
            padding: "0 24px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            transition: "opacity 0.15s",
          }}
        >
          Try again
        </button>
        <Link
          href="/host/dashboard"
          style={{
            display: "inline-flex",
            height: "42px",
            alignItems: "center",
            borderRadius: "12px",
            border: "1.5px solid var(--border)",
            padding: "0 24px",
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--foreground)",
            textDecoration: "none",
            transition: "background 0.15s",
          }}
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
