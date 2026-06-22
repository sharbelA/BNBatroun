"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  AMENITY_FILTER_KEYS,
  AMENITY_FILTER_LABELS,
  BATROUN_AREAS,
  type AmenityFilterKey,
} from "@/lib/constants";

function FilterIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  );
}

const BEDROOM_OPTIONS = [1, 2, 3, 4] as const;

function parseList(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

export default function Filters({
  resultCount,
  basePath,
  panelOnly = false,
}: {
  resultCount: number;
  basePath?: string;
  panelOnly?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);
  const target = basePath ?? pathname;

  useEffect(() => {
    if (searchParams.get("filters") === "open") {
      setSheetOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const amenities = parseList(searchParams.get("amenities")) as AmenityFilterKey[];
  const area = searchParams.get("area") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const bedrooms = searchParams.get("bedrooms") ?? "";
  const maxGuests = searchParams.get("maxGuests") ?? "";

  const hasActiveFilters =
    amenities.length > 0 || area || minPrice || maxPrice || bedrooms || maxGuests;

  function update(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("filters");
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    startTransition(() => {
      router.push(`${target}?${params.toString()}`, { scroll: false });
    });
  }

  function toggleAmenity(key: AmenityFilterKey) {
    const next = amenities.includes(key)
      ? amenities.filter((a) => a !== key)
      : [...amenities, key];
    update({ amenities: next.length ? next.join(",") : null });
  }

  function reset() {
    router.push(target, { scroll: false });
    setSheetOpen(false);
  }

  const panel = (
    <div className="flex flex-col gap-6">
      {/* Area */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-warm-500">
          Area
        </p>
        <div className="flex flex-wrap gap-2">
          {BATROUN_AREAS.map((a) => {
            const active = area === a.name;
            return (
              <button
                key={a.slug}
                type="button"
                onClick={() => update({ area: active ? null : a.name })}
                className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]"
                    : "border-[var(--border-light)] bg-white text-warm-600 hover:border-[var(--accent)]/30 hover:bg-[var(--surface)]"
                }`}
              >
                <span className="mr-1.5">{a.emoji}</span>
                {a.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-warm-500">
          Amenities
        </p>
        <div className="flex flex-wrap gap-2">
          {AMENITY_FILTER_KEYS.map((key) => {
            const active = amenities.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleAmenity(key)}
                className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]"
                    : "border-[var(--border-light)] bg-white text-warm-600 hover:border-[var(--accent)]/30 hover:bg-[var(--surface)]"
                }`}
              >
                {AMENITY_FILTER_LABELS[key]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-warm-500">
          Price per night (USD)
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Min"
            defaultValue={minPrice}
            onBlur={(e) => update({ minPrice: e.target.value || null })}
            className="h-9 w-24 rounded-lg border border-[var(--border-light)] bg-white px-3 text-sm text-warm-900 placeholder:text-warm-400 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)]"
          />
          <span className="text-sm text-warm-400">–</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Max"
            defaultValue={maxPrice}
            onBlur={(e) => update({ maxPrice: e.target.value || null })}
            className="h-9 w-24 rounded-lg border border-[var(--border-light)] bg-white px-3 text-sm text-warm-900 placeholder:text-warm-400 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)]"
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-warm-500">
          Bedrooms
        </p>
        <div className="flex flex-wrap gap-2">
          {BEDROOM_OPTIONS.map((n) => {
            const value = String(n);
            const active = bedrooms === value;
            return (
              <button
                key={n}
                type="button"
                onClick={() => update({ bedrooms: active ? null : value })}
                className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]"
                    : "border-[var(--border-light)] bg-white text-warm-600 hover:border-[var(--accent)]/30 hover:bg-[var(--surface)]"
                }`}
              >
                {n === 4 ? "4+" : n}
              </button>
            );
          })}
        </div>
      </div>

      {/* Max guests */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-warm-500">
          Guests
        </p>
        <select
          value={maxGuests}
          onChange={(e) => update({ maxGuests: e.target.value || null })}
          className="h-9 rounded-lg border border-[var(--border-light)] bg-white px-3 text-sm text-warm-700 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)]"
        >
          <option value="">Any</option>
          {[1, 2, 4, 6, 8, 10].map((n) => (
            <option key={n} value={n}>
              {n}+ guests
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={reset}
          className="self-start text-sm font-medium text-[var(--accent)] hover:underline"
        >
          Reset filters
        </button>
      )}
    </div>
  );

  if (panelOnly) return <div>{panel}</div>;

  return (
    <div className="mb-10">
      {/* Mobile trigger */}
      <div className="mb-4 flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border-light)] bg-white px-4 text-sm font-medium text-warm-700"
        >
          <FilterIcon />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-semibold text-white">
              {amenities.length + [area, minPrice, maxPrice, bedrooms, maxGuests].filter(Boolean).length}
            </span>
          )}
        </button>
        <p className="text-sm text-warm-500">
          {resultCount} chalet{resultCount !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Desktop inline panel */}
      <div className="hidden rounded-2xl border border-[var(--border-light)] bg-white p-6 md:block">
        {panel}
      </div>
      {/* Mobile bottom sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close filters"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-black/30"
          />

          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-xl">

            <div className="border-b border-[var(--border-light)] p-5">
              <h2 className="text-base font-semibold text-warm-900">
                Filters
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {panel}
            </div>

            <div className="border-t border-[var(--border-light)] p-4">
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-medium text-white"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </div>   
  );
}