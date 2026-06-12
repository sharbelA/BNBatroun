import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminListingById } from "@/lib/supabase/queries/admin";
import ListingForm from "@/app/admin/_components/ListingForm";
import DeleteListingButton from "@/app/admin/_components/DeleteListingButton";

export const metadata: Metadata = { title: "Edit chalet" };

export default async function EditListingPage(
  props: PageProps<"/admin/listings/[id]/edit">
) {
  const { id } = await props.params;
  const listing = await getAdminListingById(id);

  if (!listing) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/listings"
          className="text-sm text-warm-500 hover:text-warm-900 transition-colors"
        >
          ← All chalets
        </Link>
        <Link
          href={`/admin/listings/${id}/photos`}
          className="inline-flex h-11 md:h-9 items-center rounded-lg border border-sand-200 px-4 text-sm font-medium text-warm-700 transition hover:bg-sand-50"
        >
          Manage photos
        </Link>
      </div>

      <h1 className="mb-8 text-2xl font-semibold text-warm-900">
        Edit chalet
      </h1>

      <ListingForm mode="edit" listing={listing} />

      {/* Danger zone */}
      <section className="mt-16 rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="mb-1 text-sm font-semibold text-red-800">
          Danger zone
        </h2>
        <p className="mb-4 text-sm text-red-600">
          This action is permanent and cannot be undone.
        </p>
        <DeleteListingButton id={id} title={listing.title} />
      </section>
    </div>
  );
}
