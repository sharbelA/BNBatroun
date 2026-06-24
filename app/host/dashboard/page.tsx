import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/app/_actions/auth";
import { getHostListings } from "@/lib/supabase/queries/listings";
import { Icon } from "@/components/ui";

export const metadata: Metadata = { title: "Host dashboard" };

export default async function HostDashboardPage() {
  const user = await getCurrentUser();
  const listings = user ? await getHostListings(user.id) : [];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 md:px-6 md:py-16">

      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[var(--border-light)]">
        <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-1.5">
          Your chalets
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Manage availability for the chalets assigned to you.
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center mb-1">
            <Icon name="bed" size={24} className="text-[var(--accent)]" />
          </div>
          <p className="text-[15px] font-semibold text-[var(--foreground)]">No chalets yet</p>
          <p className="text-sm text-[var(--muted)] max-w-[280px]">
            Contact the BNBatroun team to get your chalet listed on the platform.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Cover image */}
              <div className="relative aspect-[4/3] w-full bg-[var(--surface)]">
                {listing.cover_image ? (
                  <img
                    src={listing.cover_image}
                    alt={listing.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--border)]">
                    <Icon name="bed" size={32} />
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="p-5 flex flex-col gap-1 flex-1">
                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  {listing.title}
                </h2>
                <p className="flex items-center gap-1 text-xs text-[var(--muted)]">
                  <Icon name="mapPin" size={13} />
                  {listing.location}
                </p>

                <Link
                  href={`/host/chalets/${listing.id}/availability`}
                  className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="12" height="11" rx="2"/>
                    <path d="M2 7h12"/>
                    <path d="M5 1v4"/>
                    <path d="M11 1v4"/>
                  </svg>
                  Manage availability
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
