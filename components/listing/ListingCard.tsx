/**
 * ListingCard — Airbnb-style property card.
 * Composes ImageCarousel + Badge + Icon.
 *
 * Usage:
 *   <ListingCard listing={listing} />
 */

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Icon, Badge, ImageCarousel } from "@/components/ui";
import { Listing } from "@/lib/types";
import { SITE } from "@/lib/constants";

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  const toggleSave = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsSaved(!isSaved);
    },
    [isSaved]
  );

  // Build image array: cover_image first, then any extras
 const images = [
  listing.cover_image,
  ...(listing.images ?? []).filter((img) => img !== listing.cover_image),
].filter(Boolean);

  return (
    <Link href={`/listing/${listing.slug}`} className="group block">
      {/* Image section with overlays */}
      <div className="relative">
        <ImageCarousel images={images} alt={listing.title} />

        {/* Save / favourite button */}
        <button
          onClick={toggleSave}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full hover:scale-110 transition-transform"
          aria-label={isSaved ? "Unsave listing" : "Save listing"}
        >
          <Icon
            name="heart"
            size={24}
            fill={isSaved ? "var(--accent)" : "rgba(0,0,0,0.5)"}
            stroke="white"
            strokeWidth={2}
          />
        </button>

        {/* Featured badge */}
        {listing.is_featured && (
          <div className="absolute top-3 left-3 z-10">
            <Badge>Guest favourite</Badge>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="mt-3">
        {/* Location + rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold leading-tight truncate">
            {listing.location}, {listing.region}
          </h3>
          {listing.review_count > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <Icon name="star" size={12} />
              <span className="text-sm font-medium">{listing.rating}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <p className="text-sm text-[var(--muted)] mt-0.5 truncate">
          {listing.title}
        </p>

        {/* Specs */}
        <p className="text-sm text-[var(--muted)] mt-0.5">
          {listing.bedrooms} bed{listing.bedrooms !== 1 ? "s" : ""} ·{" "}
          {listing.max_guests} guest{listing.max_guests !== 1 ? "s" : ""}
        </p>

        {/* Price */}
        <p className="mt-1.5">
          <span className="text-[15px] font-semibold">
            {SITE.currencySymbol}
            {listing.price_per_night}
          </span>{" "}
          <span className="text-sm text-[var(--muted)]">/ night</span>
        </p>
      </div>
    </Link>
  );
}
