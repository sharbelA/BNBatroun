"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";

export default function SearchBarDesktop() {
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
        className="px-4 py-2 text-sm bg-transparent outline-none w-44 placeholder:text-[var(--muted)]"
      />
      <button
        type="submit"
        className="m-1.5 w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        <Icon name="search" size={14} stroke="white" strokeWidth={3} />
      </button>
    </form>
  );
}
