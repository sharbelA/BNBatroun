"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Icon, Badge, ImageCarousel } from "@/components/ui";
import { Listing } from "@/lib/types";
import { SITE } from "@/lib/constants";

export default function ListingCard({ listing }: { listing: Listing }) {
  const [isSaved, setIsSaved] = useState(false);

  const toggleSave = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
  }, [isSaved]);

  const images = listing.images ?? [];

  return (
    <Link href={`/chalets/${listing.slug}`} className="group block card-hover">
      <div className="relative overflow-hidden rounded-xl">
        {images.length > 0 ? (
          <div className="img-zoom">
            <ImageCarousel images={images} alt={listing.title} />
          </div>
        ) : (
          <div className="relative aspect-[20/19] overflow-hidden rounded-xl bg-gradient-to-br from-[var(--surface)] to-[#ede4d8] flex flex-col items-center justify-center gap-2">
            <Icon name="home" size={36} stroke="var(--muted)" strokeWidth={1.5} fill="none" />
            <span className="text-xs text-[var(--muted)] font-medium">
              Photos coming soon
            </span>
          </div>
        )}
        <button
          onClick={toggleSave}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full hover:scale-110 transition-transform"
          aria-label={isSaved ? "Unsave" : "Save"}
        >
          <Icon name="heart" size={24} fill={isSaved ? "var(--accent)" : "rgba(0,0,0,0.5)"} stroke="white" strokeWidth={2} />
        </button>
        {listing.is_featured && (
          <div className="absolute top-3 left-3 z-10">
            <Badge>Guest favourite</Badge>
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-[15px] font-semibold leading-tight truncate">
          {listing.title}
        </h3>
        <p className="text-sm text-[var(--muted)] mt-0.5 truncate">
          {listing.location}
        </p>
        <p className="text-sm text-[var(--muted)] mt-0.5">
          {listing.bedrooms} bed{listing.bedrooms !== 1 ? "s" : ""} ·{" "}
          {listing.max_guests} guest{listing.max_guests !== 1 ? "s" : ""}
        </p>
        <p className="mt-1.5">
          <span className="text-[15px] font-semibold text-[var(--accent)]">
            {SITE.currencySymbol}
            {listing.price}
          </span>{" "}
          <span className="text-sm text-[var(--muted)]">/ night</span>
        </p>
      </div>
    </Link>
  );
}
