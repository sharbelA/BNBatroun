import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getHostsWithListingCounts } from "@/lib/supabase/queries/admin";
import HostCreatedToast from "./_components/HostCreatedToast";

export const metadata: Metadata = { title: "Hosts" };

export default async function AdminHostsPage() {
  const hosts = await getHostsWithListingCounts();

  return (
    <div className="flex flex-col gap-6">
      <Suspense>
        <HostCreatedToast />
      </Suspense>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-warm-900">Hosts</h1>
        <Link
          href="/admin/hosts/new"
          className="inline-flex h-11 md:h-9 items-center rounded-lg px-4 text-sm font-medium text-white transition hover:opacity-90"
          style={{ backgroundColor: "var(--accent)" }}
        >
          + Create host
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-sand-200 bg-white">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-sand-200 bg-sand-50 text-left">
            <tr>
              {["Name", "Phone", "WhatsApp", "Chalets", "Joined"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium text-warm-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {hosts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-warm-400"
                >
                  No hosts yet.{" "}
                  <Link
                    href="/admin/hosts/new"
                    className="text-sea-600 hover:underline"
                  >
                    Create the first one
                  </Link>
                </td>
              </tr>
            ) : (
              hosts.map((host) => (
                <tr
                  key={host.id}
                  className="hover:bg-sand-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-warm-900">
                    {host.name}
                  </td>
                  <td className="px-4 py-3 text-warm-600">
                    {host.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-warm-600">
                    {host.whatsapp ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-warm-900">
                    {host.listing_count}
                  </td>
                  <td className="px-4 py-3 text-warm-500">
                    {new Date(host.created_at).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-warm-400">
        {hosts.length} host{hosts.length !== 1 ? "s" : ""} total
      </p>
    </div>
  );
}
