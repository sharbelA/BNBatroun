/**
 * Header — auth-aware server component.
 * Fetches current user role and passes to client UserMenu.
 */

import Link from "next/link";
import { Icon, Container } from "@/components/ui";
import { getCurrentUser } from "@/app/_actions/auth";
import { SITE } from "@/lib/constants";
import UserMenu from "./UserMenu";
import SearchBarDesktop, { FilterButton } from "./SearchBarDesktop";
import SearchBarMobile, { MobileFilterButton } from "./SearchBarMobile";

export default async function Header() {
  const user = await getCurrentUser();
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <header className="sticky top-0 z-50 header-surface border-b border-[var(--border-light)]">
      <Container>
        <div className="flex h-[var(--header-height)] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center">
              <Icon name="home" size={18} stroke="white" fill="none" />
            </div>
            <span
              className="text-xl font-semibold tracking-tight text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {SITE.name}
            </span>
          </Link>

          <SearchBarDesktop />
          <FilterButton />

          <div className="flex items-center gap-1 shrink-0">
            <Link
              href="/list-your-chalet"
              className="hidden lg:block text-sm font-medium hover:bg-[var(--surface)] rounded-full px-4 py-2.5 transition-colors duration-200"
            >
              List your property
            </Link>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full text-[#25D366] hover:bg-[var(--surface)] transition-colors duration-200"
              >
                <Icon name="whatsapp" size={20} />
              </a>
            )}
            <UserMenu user={user} />
          </div>
        </div>

        {/* Mobile: search bar full width with filter icon */}
        <div className="md:hidden flex items-center gap-2 mb-4">
          <SearchBarMobile />
          <MobileFilterButton />
        </div>
      </Container>
    </header>
  );
}
