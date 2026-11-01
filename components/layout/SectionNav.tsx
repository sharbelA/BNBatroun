"use client";

/**
 * SectionNav — Daily stays / Seasonal / For sale switcher.
 * Highlights the section matching the current URL (detail pages included).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "/chalets", label: "Daily stays" },
  { href: "/seasonal", label: "Seasonal" },
  { href: "/for-sale", label: "For sale" },
] as const;

const ACTIVE =
  "border-[var(--accent)] bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]";
const NEUTRAL =
  "border-[var(--border-light)] bg-white text-[var(--foreground)] hover:bg-[var(--surface)]";
const TINTED =
  "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white";

export default function SectionNav({ variant }: { variant: "desktop" | "mobile" }) {
  const pathname = usePathname();

  const items = SECTIONS.map(({ href, label }, i) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    const tone = active ? ACTIVE : i === 0 ? NEUTRAL : TINTED;
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={
          variant === "desktop"
            ? `hidden lg:inline-flex items-center whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 ${tone}`
            : `inline-flex h-10 shrink-0 items-center rounded-full border px-5 text-sm font-semibold transition-colors ${tone}`
        }
      >
        {label}
      </Link>
    );
  });

  if (variant === "desktop") return <>{items}</>;

  return (
    <nav aria-label="Sections" className="lg:hidden -mx-1 mb-3 flex gap-2 overflow-x-auto px-1">
      {items}
    </nav>
  );
}
