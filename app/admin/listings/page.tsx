import type { Metadata } from "next";
import Link from "next/link";
import { getAdminListings } from "@/lib/supabase/queries/admin";
import CopyListingButton from "@/app/admin/_components/CopyListingButton";
import RemoveSeasonalButton from "@/app/admin/_components/RemoveSeasonalButton";
import {
  LISTING_TYPES,
  LISTING_TYPE_META,
  PRICE_PERIODS,
  parseListingType,
} from "@/lib/constants";

export const metadata: Metadata = { title: "Listings" };

const PLURAL = {
  daily: "chalets",
  seasonal: "seasonal rentals",
  sale: "properties",
} as const;

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const type = parseListingType((await searchParams).type);
  const all = await getAdminListings();
  const listings = all.filter((l) => (l.listing_type ?? "daily") === type);
  const counts = Object.fromEntries(
    LISTING_TYPES.map((t) => [t, all.filter((l) => (l.listing_type ?? "daily") === t).length])
  ) as Record<(typeof LISTING_TYPES)[number], number>;

  const meta = LISTING_TYPE_META[type];
  const priceHeader =
    type === "daily" ? "Price / night" : type === "seasonal" ? "Rent" : "Asking price";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-warm-900">All {PLURAL[type]}</h1>
        <Link
          href={`/admin/listings/new?type=${type}`}
          className="inline-flex h-11 md:h-9 items-center rounded-lg px-4 text-sm font-medium text-white transition hover:opacity-90"
          style={{ backgroundColor: "var(--accent)" }}
        >
          + New {meta.adminLabel}
        </Link>
      </div>

      {/* Type tabs */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist">
        {LISTING_TYPES.map((t) => (
          <Link
            key={t}
            href={`/admin/listings?type=${t}`}
            role="tab"
            aria-selected={t === type}
            className={`inline-flex h-11 md:h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${
              t === type
                ? "border-warm-900 bg-warm-900 text-sand-50"
                : "border-sand-200 bg-white text-warm-600 hover:bg-sand-50"
            }`}
          >
            {LISTING_TYPE_META[t].label}
            <span className={t === type ? "text-sand-300" : "text-warm-400"}>{counts[t]}</span>
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-sand-200 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b border-sand-200 bg-sand-50 text-left">
            <tr>
              {["Title", "Host", "Location", priceHeader, "Status", "Featured", ""].map((h, i) => (
                <th key={i} className="px-4 py-3 font-medium text-warm-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {listings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-warm-400">
                  No {PLURAL[type]} yet.{" "}
                  <Link
                    href={`/admin/listings/new?type=${type}`}
                    className="text-sea-600 hover:underline"
                  >
                    Create your first one
                  </Link>
                </td>
              </tr>
            ) : (
              listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-sand-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-warm-900">{listing.title}</span>
                    {listing.internal_name && (
                      <span className="block text-xs text-warm-400 mt-0.5">
                        🔒 {listing.internal_name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-warm-600">{listing.host_name}</td>
                  <td className="px-4 py-3 text-warm-600">{listing.location}</td>
                  <td className="px-4 py-3 text-warm-900">
                    ${listing.price.toLocaleString()}
                    {type === "seasonal" && listing.price_period && (
                      <span className="text-xs text-warm-400">
                        {" "}
                        {PRICE_PERIODS.find((p) => p.value === listing.price_period)?.label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        listing.is_active
                          ? "inline-flex items-center gap-1.5 text-emerald-700"
                          : "text-warm-400"
                      }
                    >
                      {listing.is_active ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          Active
                        </>
                      ) : (
                        "Inactive"
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">{listing.is_featured ? "★" : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <Link
                        href={`/admin/listings/${listing.id}/edit`}
                        className="text-sea-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/listings/${listing.id}/photos`}
                        className="text-sea-600 hover:underline"
                      >
                        Photos
                      </Link>
                      {type === "daily" && (
                        <Link
                          href={`/admin/listings/${listing.id}/availability`}
                          className="text-sea-600 hover:underline"
                        >
                          Availability
                        </Link>
                      )}
                      {type === "daily" && (
                        <CopyListingButton id={listing.id} target="seasonal" />
                      )}
                      {type === "seasonal" && (
                        <>
                          <CopyListingButton id={listing.id} target="daily" />
                          <RemoveSeasonalButton id={listing.id} title={listing.title} />
                        </>
                      )}
                      <Link
                        href={`${meta.publicPath}/${listing.slug}`}
                        target="_blank"
                        className="text-warm-400 hover:text-warm-600"
                      >
                        View ↗
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-warm-400">
        {listings.length} {listings.length === 1 ? meta.adminLabel : PLURAL[type]} total
      </p>
    </div>
  );
}
