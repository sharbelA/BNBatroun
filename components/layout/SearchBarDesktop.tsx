import Link from "next/link";
import { Icon } from "@/components/ui";

export default function SearchBarDesktop() {
  return (
    <Link
      href="/chalets"
      className="hidden md:flex items-center border border-[var(--border)] rounded-full px-2 py-2 transition-all duration-200 hover:shadow-[var(--card-shadow)] hover:border-[var(--accent)]/30"
    >
      <span className="px-4 text-sm font-medium border-r border-[var(--border)]">
        Batroun
      </span>
      <span className="px-4 text-sm font-medium border-r border-[var(--border)]">
        Any week
      </span>
      <span className="px-4 text-sm text-[var(--muted)]">Add guests</span>
      <div className="ml-2 w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center">
        <Icon name="search" size={14} stroke="white" strokeWidth={3} />
      </div>
    </Link>
  );
}
