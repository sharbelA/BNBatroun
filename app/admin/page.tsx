import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin overview" };

export default function AdminPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-warm-900">
        Admin overview
      </h1>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {["Total listings", "Active hosts", "All users"].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-sand-200 bg-white px-6 py-5"
          >
            <p className="text-sm text-warm-500">{label}</p>
            <p className="mt-1 text-3xl font-semibold text-warm-900">—</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-4">
        <Link
          href="/admin/listings"
          className="inline-flex h-11 md:h-9 items-center rounded-lg border border-sand-200 px-4 text-sm font-medium text-warm-700 hover:bg-sand-50 transition-colors"
        >
          Manage listings
        </Link>
        <Link
          href="/admin/users"
          className="inline-flex h-11 md:h-9 items-center rounded-lg border border-sand-200 px-4 text-sm font-medium text-warm-700 hover:bg-sand-50 transition-colors"
        >
          Manage users
        </Link>
      </div>
    </div>
  );
}
