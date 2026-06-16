import Link from "next/link";
import { Icon } from "@/components/ui";

export default function SearchBarMobile() {
  return (
    <Link
      href="/chalets?filters=open"
      className="md:hidden w-full flex items-center gap-3 border border-[var(--border)] rounded-full px-4 py-3 bg-white mb-4 transition-shadow duration-200 hover:shadow-[var(--card-shadow)]"
    >
      <Icon name="search" size={18} strokeWidth={2.5} />
      <div className="text-left">
        <p className="text-sm font-semibold leading-tight">Where to?</p>
        <p className="text-xs text-[var(--muted)] leading-tight mt-0.5">
          Browse chalets in Batroun
        </p>
      </div>
    </Link>
  );
}
