"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui";

export default function SearchBarDesktop() {
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
      className="hidden md:flex items-center border border-[var(--border)] rounded-full transition-all duration-200 hover:shadow-[var(--card-shadow)] hover:border-[var(--accent)]/30 focus-within:shadow-[var(--card-shadow)] focus-within:border-[var(--accent)]/30"
    >
      <span className="px-4 py-2 text-sm font-medium border-r border-[var(--border)]">
        Batroun
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search chalets..."
        className="px-4 py-2 text-sm bg-transparent outline-none w-40 placeholder:text-[var(--muted)]"
      />
      {hasFilters && (
        <button
          type="button"
          onClick={handleClear}
          className="px-3 text-xs font-medium text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
        >
          Clear
        </button>
      )}
      <button
        type="submit"
        className="m-1.5 w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        <Icon name="search" size={14} stroke="white" strokeWidth={3} />
      </button>
    </form>
  );
}
