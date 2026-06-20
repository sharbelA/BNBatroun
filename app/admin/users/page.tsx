import type { Metadata } from "next";

export const metadata: Metadata = { title: "Users (admin)" };

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-warm-900">Users</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select className="h-11 md:h-9 rounded-lg border border-sand-200 bg-white px-3 text-sm text-warm-700 outline-none">
          <option value="">All roles</option>
          <option value="host">Host</option>
          <option value="admin">Admin</option>
        </select>
        <input
          type="text"
          placeholder="Search by name or email…"
          className="h-11 md:h-9 w-full rounded-lg border border-sand-200 bg-white px-3 text-sm text-warm-700 outline-none sm:w-64"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-sand-200 bg-white">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-sand-200 bg-sand-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-warm-600">Name</th>
              <th className="px-4 py-3 font-medium text-warm-600">Email</th>
              <th className="px-4 py-3 font-medium text-warm-600">Role</th>
              <th className="px-4 py-3 font-medium text-warm-600">Joined</th>
              <th className="px-4 py-3 font-medium text-warm-600" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-sm text-warm-400">
                No users found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
