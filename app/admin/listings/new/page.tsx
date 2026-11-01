import type { Metadata } from "next";
import Link from "next/link";
import { getHosts } from "@/lib/supabase/queries/admin";
import ListingForm from "@/app/admin/_components/ListingForm";
import { LISTING_TYPE_META, parseListingType } from "@/lib/constants";

export const metadata: Metadata = { title: "New listing" };

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const type = parseListingType((await searchParams).type);
  const hosts = await getHosts();
  const noun = LISTING_TYPE_META[type].adminLabel;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href={`/admin/listings?type=${type}`}
          className="text-sm text-warm-500 hover:text-warm-900 transition-colors"
        >
          ← All {type === "daily" ? "chalets" : type === "seasonal" ? "seasonal rentals" : "properties"}
        </Link>
      </div>

      <h1 className="mb-8 text-2xl font-semibold text-warm-900">New {noun}</h1>

      <ListingForm mode="create" hosts={hosts} type={type} />
    </div>
  );
}
