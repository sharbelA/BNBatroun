"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";

export default function SearchBarMobile() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/chalets?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/chalets");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="md:hidden w-full flex items-center gap-2 border border-[var(--border)] rounded-full px-4 py-2.5 bg-white mb-4 transition-shadow duration-200 focus-within:shadow-[var(--card-shadow)] focus-within:border-[var(--accent)]/30"
    >
      <Icon name="search" size={18} strokeWidth={2.5} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search chalets..."
        className="flex-1 text-sm bg-transparent outline-none placeholder:text-[var(--muted)]"
      />
      <button
        type="submit"
        className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0"
      >
        <Icon name="search" size={12} stroke="white" strokeWidth={3} />
      </button>
    </form>
  );
}

function MobileFilterButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push("/chalets?filters=open")}
      className="md:hidden flex items-center gap-2 border border-[var(--border)] rounded-full px-4 py-2.5 bg-white mb-4 text-sm font-medium hover:border-[var(--accent)]/30 transition-all"
    >
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="11" y1="18" x2="13" y2="18" />
      </svg>
      Filters
    </button>
  );
}

export { MobileFilterButton };
