import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminListingById } from "@/lib/supabase/queries/admin";
import { getListingAvailabilityWindow } from "@/lib/supabase/queries/listings";
import AvailabilityCalendar from "@/components/calendar/AvailabilityCalendar";

export const metadata: Metadata = { title: "Manage availability" };

export default async function AdminAvailabilityPage(
  props: PageProps<"/admin/listings/[id]/availability">
) {
  const { id } = await props.params;

  const listing = await getAdminListingById(id);
  if (!listing) notFound();

  const availability = await getListingAvailabilityWindow(id);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/listings"
          className="text-sm text-warm-500 hover:text-warm-900 transition-colors"
        >
          ← All chalets
        </Link>
      </div>

      <h1 className="mb-1 text-2xl font-semibold text-warm-900">
        {listing.title} — availability
      </h1>
      <p className="mb-8 text-sm text-warm-500">
        Click a date, or click and drag to select a range, then set its
        status — available, booked, or blocked — and add an optional note.
      </p>

      <AvailabilityCalendar
        listingId={listing.id}
        initialAvailability={availability}
        mode="admin"
      />
    </div>
  );
}
