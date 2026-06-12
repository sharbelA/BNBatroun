import type { Metadata } from "next";

export const metadata: Metadata = { title: "Users (admin)" };

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-zinc-900">Users</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select className="h-9 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700">
          <option value="">All roles</option>
          <option value="host">Host</option>
          <option value="admin">Admin</option>
        </select>
        <input
          type="text"
          placeholder="Search by name or email…"
          className="h-9 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 w-64"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-100">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                No users found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
