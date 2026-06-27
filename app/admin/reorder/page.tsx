import type { Metadata } from "next";
import { getAdminListings } from "@/lib/supabase/queries/admin";
import ReorderGrid from "./_components/ReorderGrid";

export const metadata: Metadata = { title: "Reorder listings" };

export default async function ReorderPage() {
  const listings = await getAdminListings();

  // Sort by display_order
  const sorted = [...listings].sort(
    (a, b) => (a.display_order ?? 999) - (b.display_order ?? 999)
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-warm-900">Reorder listings</h1>
        <p className="mt-1 text-sm text-warm-500">
          Drag chalets to change the order on the public site. First item appears first.
        </p>
      </div>
      <ReorderGrid listings={sorted} />
    </div>
  );
}
