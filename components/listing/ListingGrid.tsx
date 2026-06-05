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
}

export default function ListingGrid({
  listings,
  title = "Stays across Lebanon",
}: ListingGridProps) {
  if (listings.length === 0) return null;

  return (
    <Container as="section" className="py-8 md:py-12">
      {title && (
        <h2 className="text-2xl font-semibold tracking-tight mb-6">{title}</h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </Container>
  );
}
