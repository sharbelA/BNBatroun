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
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <Link
          href="/admin/listings"
          className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-warm-900 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12L6 8L10 4"/></svg>
          All chalets
        </Link>
      </div>

      <div
        style={{
          marginBottom: "32px",
          paddingBottom: "24px",
          borderBottom: "1px solid var(--border-light, #ebebeb)",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--foreground)",
            marginBottom: "6px",
          }}
        >
          {listing.title}
        </h1>
        <p style={{ fontSize: "14px", color: "var(--muted)" }}>
          Click a date or drag to select a range, then set its status and add an optional note.
        </p>
      </div>

      <AvailabilityCalendar
        listingId={listing.id}
        initialAvailability={availability}
        mode="admin"
      />
    </div>
  );
}
