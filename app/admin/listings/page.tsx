import type { Metadata } from "next";
import Link from "next/link";
import { getAdminListings } from "@/lib/supabase/queries/admin";

export const metadata: Metadata = { title: "Chalets" };

export default async function AdminListingsPage() {
  const listings = await getAdminListings();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-warm-900">All chalets</h1>
        <Link
          href="/admin/listings/new"
         className="inline-flex h-11 md:h-9 items-center rounded-lg px-4 text-sm font-medium text-white transition hover:opacity-90" style={{ backgroundColor: "var(--accent)" }}
        >
          + New chalet
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-sand-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-sand-200 bg-sand-50 text-left">
            <tr>
              {[
                "Title",
                "Host",
                "Location",
                "Price / night",
                "Status",
                "Featured",
                "",
              ].map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 font-medium text-warm-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {listings.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-sm text-warm-400"
                >
                  No chalets yet.{" "}
                  <Link
                    href="/admin/listings/new"
                    className="text-sea-600 hover:underline"
                  >
                    Create your first one
                  </Link>
                </td>
              </tr>
            ) : (
              listings.map((listing) => (
                <tr
                  key={listing.id}
                  className="hover:bg-sand-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-warm-900">
                    {listing.title}
                  </td>
                  <td className="px-4 py-3 text-warm-600">
                    {listing.host_name}
                  </td>
                  <td className="px-4 py-3 text-warm-600">
                    {listing.location}
                  </td>
                  <td className="px-4 py-3 text-warm-900">
                    ${listing.price}
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
                  <td className="px-4 py-3">
                    {listing.is_featured ? "★" : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
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
                      <Link
                        href={`/admin/listings/${listing.id}/availability`}
                        className="text-sea-600 hover:underline"
                      >
                        Availability
                      </Link>
                      <Link
                        href={`/chalets/${listing.slug}`}
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
        {listings.length} chalet{listings.length !== 1 ? "s" : ""} total
      </p>
    </div>
  );
}
