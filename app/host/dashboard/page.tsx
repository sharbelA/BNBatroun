import type { Metadata } from "next";
import Image from "next/image";
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
      <h1 className="mb-1 text-2xl font-semibold text-warm-900">
        Your chalets
      </h1>
      <p className="mb-8 text-sm text-warm-500">
        Manage availability for the chalets assigned to you.
      </p>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-sand-200 bg-white py-20 text-center">
          <p className="text-sm font-medium text-warm-700">
            You have no listings yet.
          </p>
          <p className="text-sm text-warm-400">
            Contact us to add your chalet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white"
            >
              <div className="relative aspect-[4/3] w-full bg-sand-100">
                {listing.cover_image ? (
                  <Image
                    src={listing.cover_image}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-warm-300">
                    <Icon name="bed" size={28} />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-1 p-4">
                <h2 className="text-sm font-semibold text-warm-900">
                  {listing.title}
                </h2>
                <p className="flex items-center gap-1 text-xs text-warm-500">
                  <Icon name="mapPin" size={13} />
                  {listing.location}
                </p>

                <Link
                  href={`/host/chalets/${listing.id}/availability`}
                  className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white transition hover:opacity-90"
                >
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
