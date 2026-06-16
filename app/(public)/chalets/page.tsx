import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Container } from "@/components/ui";
import { getFilteredListings } from "@/lib/supabase/queries/listings";
import { AMENITY_FILTER_KEYS, type AmenityFilterKey } from "@/lib/constants";
import ListingGrid from "@/components/listing/ListingGrid";
import Filters from "./_components/Filters";

export const metadata: Metadata = { title: "Browse chalets" };

function parseAmenities(value: string | string[] | undefined): AmenityFilterKey[] {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return [];
  return raw
    .split(",")
    .filter((key): key is AmenityFilterKey =>
      (AMENITY_FILTER_KEYS as readonly string[]).includes(key)
    );
}

function parseNumber(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

export default async function ChaletsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const filters = {
    amenities: parseAmenities(params.amenities),
    minPrice: parseNumber(params.minPrice),
    maxPrice: parseNumber(params.maxPrice),
    bedrooms: parseNumber(params.bedrooms),
    maxGuests: parseNumber(params.maxGuests),
    area: typeof params.area === "string" ? params.area : undefined,
  };

  const listings = await getFilteredListings(filters);

  return (
    <>
      <Header />
      <main className="flex-1">
        <Container className="py-14 md:py-20">
          <h1 className="mb-10 text-3xl md:text-4xl tracking-tight text-warm-900">
            Chalets in Batroun
          </h1>

          <Filters resultCount={listings.length} />

          <p className="mb-6 hidden text-sm text-warm-500 md:block">
            {listings.length} chalet{listings.length !== 1 ? "s" : ""} available
          </p>

          {listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--border-light)] bg-white py-24 text-center">
              <p className="text-sm font-medium text-warm-700">
                No chalets match your filters.
              </p>
              <Link
                href="/chalets"
                className="text-sm font-medium text-[var(--accent)] hover:underline"
              >
                Reset filters
              </Link>
            </div>
          ) : (
            <ListingGrid listings={listings} title="" />
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
