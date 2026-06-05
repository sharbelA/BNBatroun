/**
 * RegionPills — horizontal scrollable region filter buttons.
 * Used on the homepage hero and later on the search/explore page.
 *
 * Usage:
 *   <RegionPills />
 *   <RegionPills activeRegion="batroun" onSelect={handleSelect} />
 */

"use client";

import { REGIONS, type RegionSlug } from "@/lib/constants";

interface RegionPillsProps {
  activeRegion?: RegionSlug | null;
  onSelect?: (slug: RegionSlug) => void;
}

export default function RegionPills({
  activeRegion,
  onSelect,
}: RegionPillsProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {REGIONS.map((region) => {
        const isActive = activeRegion === region.slug;

        return (
          <button
            key={region.slug}
            onClick={() => onSelect?.(region.slug)}
            className={`flex items-center gap-2 px-5 py-2.5 border rounded-full text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-[var(--foreground)] text-white border-[var(--foreground)]"
                : "bg-white border-[var(--border)] hover:border-[var(--foreground)] hover:shadow-sm"
            }`}
          >
            <span className="text-base">{region.emoji}</span>
            {region.name}
          </button>
        );
      })}
    </div>
  );
}
