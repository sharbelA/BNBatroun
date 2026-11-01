"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Icon, Badge, ImageCarousel } from "@/components/ui";
import { Listing } from "@/lib/types";
import { LISTING_TYPE_META, PRICE_PERIODS, PROPERTY_KINDS, SITE } from "@/lib/constants";

export default function ListingCard({ listing }: { listing: Listing }) {
  const [isSaved, setIsSaved] = useState(false);

  const toggleSave = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
  }, [isSaved]);

  const images = listing.images ?? [];
  const type = listing.listing_type ?? "daily";
  const basePath = LISTING_TYPE_META[type].publicPath;
  const period = PRICE_PERIODS.find((p) => p.value === listing.price_period)?.label;
  const kind = PROPERTY_KINDS.find((k) => k.value === listing.property_kind)?.label;

  return (
    <Link href={listing.slug ? `${basePath}/${listing.slug}` : basePath} className="group block card-hover">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border-light)]">
        {images.length > 0 ? (
          <div className="img-zoom">
            <ImageCarousel images={images} alt={listing.title} />
          </div>
        ) : (
          <div className="relative aspect-[20/19] overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--surface)] to-[#ede4d8] flex flex-col items-center justify-center gap-2">
            <Icon name="home" size={36} stroke="var(--muted)" strokeWidth={1.5} fill="none" />
            <span className="text-xs text-[var(--muted)] font-medium">
              Photos coming soon
            </span>
          </div>
        )}
        <button
          onClick={toggleSave}
          className="absolute top-3 right-3 z-10 w-11 h-11 flex items-center justify-center rounded-full hover:scale-110 transition-transform duration-200"
          aria-label={isSaved ? "Unsave" : "Save"}
        >
          <Icon name="heart" size={24} fill={isSaved ? "var(--accent)" : "rgba(0,0,0,0.5)"} stroke="white" strokeWidth={2} />
        </button>
        {type === "daily" ? (
          listing.is_featured && (
            <div className="absolute top-3 left-3 z-10">
              <Badge>Guest favourite</Badge>
            </div>
          )
        ) : (
          <div className="absolute top-3 left-3 z-10">
            <Badge>{type === "sale" ? (kind ?? "For sale") : "Seasonal rental"}</Badge>
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3
          className="text-base font-medium leading-snug truncate text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {listing.title}
        </h3>
        <p className="text-sm text-[var(--muted)] mt-1 truncate">
          {listing.location}
        </p>
        <p className="text-sm text-[var(--muted)] mt-0.5">
          {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? "s" : ""} ·{" "}
          {type === "daily"
            ? `${listing.max_guests} guest${listing.max_guests !== 1 ? "s" : ""}`
            : listing.area_sqm
              ? `${listing.area_sqm} m²`
              : `${listing.bathrooms} bath${listing.bathrooms !== 1 ? "s" : ""}`}
        </p>
        <p className="mt-2">
          {type === "daily" && (listing.weekend_price ?? listing.price) !== listing.price && (
            <span className="text-sm text-[var(--muted)] mr-0.5">From </span>
          )}
          <span className="text-[15px] font-semibold text-[var(--foreground)]">
            {SITE.currencySymbol}
            {type === "daily" ? listing.price : listing.price.toLocaleString("en-US")}
          </span>{" "}
          {type === "daily" && <span className="text-sm text-[var(--muted)]">/ night</span>}
          {type === "seasonal" && period && (
            <span className="text-sm text-[var(--muted)]">{period.replace("per ", "/ ")}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
