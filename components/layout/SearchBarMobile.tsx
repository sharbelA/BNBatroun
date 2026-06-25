"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui";

export default function SearchBarMobile() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") ?? "";
  const [query, setQuery] = useState(currentSearch);

  const hasFilters =
    searchParams.has("search") ||
    searchParams.has("amenities") ||
    searchParams.has("area") ||
    searchParams.has("minPrice") ||
    searchParams.has("maxPrice") ||
    searchParams.has("bedrooms") ||
    searchParams.has("maxGuests");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("search", query.trim());
    } else {
      params.delete("search");
    }
    router.push(`/chalets?${params.toString()}`);
  }

  function handleClear() {
    setQuery("");
    router.push("/chalets");
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
      {hasFilters && (
        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-medium text-[var(--muted)] hover:text-[var(--accent)] transition-colors shrink-0"
        >
          Clear
        </button>
      )}
      <button
        type="submit"
        className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0"
      >
        <Icon name="search" size={12} stroke="white" strokeWidth={3} />
      </button>
    </form>
  );
}
