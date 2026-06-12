/**
 * ListingGrid — responsive card grid with optional title.
 * Reusable for featured, search results, region pages, etc.
 *
 * Usage:
 *   <ListingGrid listings={listings} title="Guest favourites" />
 */

import { Container } from "@/components/ui";
import { Listing } from "@/lib/types";
import ListingCard from "./ListingCard";

interface ListingGridProps {
  listings: Listing[];
  title?: string;
  bg?: "white" | "sand";
}

export default function ListingGrid({
  listings,
  title = "Stays across Lebanon",
  bg = "white",
}: ListingGridProps) {
  if (listings.length === 0) return null;

  return (
    <div className={bg === "sand" ? "bg-sand-50" : ""}>
      <Container as="section" className="py-14 md:py-20">
      {title && (
        <h2 className="text-2xl md:text-3xl tracking-tight mb-10 section-title">{title}</h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
      </Container>
    </div>
  );
}
