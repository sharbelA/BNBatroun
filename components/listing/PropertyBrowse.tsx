/**
 * PropertyBrowse — shared browse page for seasonal rentals and properties for sale.
 * Server component; filters are a plain GET form (works without client JS).
 */

import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Container } from "@/components/ui";
import ListingGrid from "@/components/listing/ListingGrid";
import { getListingsByType, type PropertyFilters } from "@/lib/supabase/queries/listings";
import { AREA_NAMES, BATROUN_AREAS, LISTING_TYPE_META, PROPERTY_KINDS } from "@/lib/constants";

type Params = { [key: string]: string | string[] | undefined };

function first(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw || undefined;
}

function list(value: string | string[] | undefined): string[] {
  const known = new Set<string>(AREA_NAMES);
  return (Array.isArray(value) ? value : [value])
    .flatMap((v) => (v ? v.split(",") : []))
    .map((v) => v.trim())
    .filter((v) => known.has(v));
}

function num(value: string | string[] | undefined): number | undefined {
  const raw = first(value);
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

const COPY = {
  seasonal: {
    heading: "Seasonal rentals in Batroun",
    intro: "Stay for the whole summer or season. Monthly and seasonal rates.",
    noun: ["rental", "rentals"],
    empty: "No seasonal rentals match your filters.",
  },
  sale: {
    heading: "Properties for sale in Batroun",
    intro: "Apartments, villas, chalets and land — own a piece of the coast.",
    noun: ["property", "properties"],
    empty: "No properties match your filters.",
  },
} as const;

const fieldCls =
  "h-11 md:h-10 w-full rounded-xl border border-sand-200 bg-white px-3 text-sm text-warm-900 outline-none transition focus:border-sea-400 focus:ring-2 focus:ring-sea-100";

export default async function PropertyBrowse({
  type,
  params,
}: {
  type: "seasonal" | "sale";
  params: Params;
}) {
  const filters: PropertyFilters = {
    areas: list(params.area),
    kind: type === "sale" ? first(params.kind) : undefined,
    minPrice: num(params.minPrice),
    maxPrice: num(params.maxPrice),
    bedrooms: num(params.bedrooms),
  };
  const listings = await getListingsByType(type, filters);
  const copy = COPY[type];
  const basePath = LISTING_TYPE_META[type].publicPath;
  const hasFilters = Object.values(filters).some((v) =>
    Array.isArray(v) ? v.length > 0 : v !== undefined
  );

  return (
    <>
      <Header />
      <main className="flex-1">
        <Container className="py-10 md:py-16">
          <h1 className="text-3xl md:text-4xl tracking-tight text-warm-900">{copy.heading}</h1>
          <p className="mt-2 mb-8 max-w-2xl text-sm md:text-base text-warm-500">{copy.intro}</p>

          <form
            method="get"
            action={basePath}
            className="mb-8 grid grid-cols-2 gap-3 rounded-2xl border border-[var(--border-light)] bg-white p-4 md:grid-cols-3 lg:grid-cols-[repeat(5,1fr)_auto]"
          >
            <details className="group relative">
              <summary
                className={`${fieldCls} flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden`}
              >
                <span className="truncate">
                  {filters.areas?.length
                    ? filters.areas.length === 1
                      ? filters.areas[0]
                      : `${filters.areas.length} areas`
                    : "All areas"}
                </span>
                <span aria-hidden className="text-warm-400 transition group-open:rotate-180">▾</span>
              </summary>
              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-sand-200 bg-white p-2 shadow-lg sm:min-w-[14rem]">
                {BATROUN_AREAS.map((a) => (
                  <label
                    key={a.slug}
                    className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg px-3 text-sm text-warm-700 hover:bg-sand-50 md:min-h-9"
                  >
                    <input
                      type="checkbox"
                      name="area"
                      value={a.name}
                      defaultChecked={filters.areas?.includes(a.name)}
                      className="h-4 w-4 rounded border-sand-300 accent-sea-600"
                    />
                    {a.name}
                  </label>
                ))}
              </div>
            </details>
            {type === "sale" ? (
              <select name="kind" defaultValue={filters.kind ?? ""} className={fieldCls} aria-label="Property type">
                <option value="">Any type</option>
                {PROPERTY_KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
            ) : (
              <select name="bedrooms" defaultValue={filters.bedrooms ?? ""} className={fieldCls} aria-label="Bedrooms">
                <option value="">Any bedrooms</option>
                {[1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {n} bedroom{n > 1 ? "s" : ""}
                  </option>
                ))}
                <option value="4">4+ bedrooms</option>
              </select>
            )}
            <input
              name="minPrice"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Min price ($)"
              defaultValue={filters.minPrice ?? ""}
              className={fieldCls}
              aria-label="Minimum price"
            />
            <input
              name="maxPrice"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Max price ($)"
              defaultValue={filters.maxPrice ?? ""}
              className={fieldCls}
              aria-label="Maximum price"
            />
            {type === "sale" ? (
              <select name="bedrooms" defaultValue={filters.bedrooms ?? ""} className={fieldCls} aria-label="Bedrooms">
                <option value="">Any bedrooms</option>
                {[1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {n} bedroom{n > 1 ? "s" : ""}
                  </option>
                ))}
                <option value="4">4+ bedrooms</option>
              </select>
            ) : (
              <span className="hidden lg:block" />
            )}
            <div className="col-span-2 flex gap-2 md:col-span-3 lg:col-span-1">
              <button
                type="submit"
                className="h-11 md:h-10 flex-1 rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
              >
                Search
              </button>
              {hasFilters && (
                <Link
                  href={basePath}
                  className="inline-flex h-11 md:h-10 items-center rounded-xl border border-sand-200 px-4 text-sm font-medium text-warm-700 hover:bg-sand-50"
                >
                  Reset
                </Link>
              )}
            </div>
          </form>

          <p className="mb-6 text-sm text-warm-500">
            {listings.length} {listings.length === 1 ? copy.noun[0] : copy.noun[1]} available
          </p>

          {listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--border-light)] bg-white px-4 py-20 text-center">
              <p className="text-sm font-medium text-warm-700">
                {hasFilters ? copy.empty : "Nothing listed here yet — check back soon."}
              </p>
              {hasFilters && (
                <Link href={basePath} className="text-sm font-medium text-[var(--accent)] hover:underline">
                  Reset filters
                </Link>
              )}
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
