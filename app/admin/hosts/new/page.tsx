import type { Metadata } from "next";
import Link from "next/link";
import CreateHostForm from "@/app/admin/hosts/_components/CreateHostForm";

export const metadata: Metadata = { title: "New host" };

export default function NewHostPage() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/hosts"
          className="text-sm text-warm-500 hover:text-warm-900 transition-colors"
        >
          ← Hosts
        </Link>
      </div>

      <h1 className="mb-1 text-2xl font-semibold text-warm-900">
        Create host account
      </h1>
      <p className="mb-8 text-sm text-warm-500">
        Sets up a login for a host and creates their profile. Share the email
        and password with them directly.
      </p>

      <CreateHostForm />
    </div>
  );
}
