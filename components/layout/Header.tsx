/**
 * Header — auth-aware server component.
 * Fetches current user role and passes to client UserMenu.
 */

import Link from "next/link";
import { Icon, Container } from "@/components/ui";
import { getCurrentUser } from "@/app/_actions/auth";
import { SITE } from "@/lib/constants";
import UserMenu from "./UserMenu";

export default async function Header() {
  const user = await getCurrentUser();
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[var(--border-light)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <Container>
        <div className="flex h-[var(--header-height)] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <Icon name="home" size={20} stroke="white" fill="none" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--foreground)]">
              {SITE.name}
            </span>
          </Link>

          <Link
            href="/chalets"
            className="hidden md:flex items-center border border-[var(--border)] rounded-full px-2 py-2 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <span className="px-4 text-sm font-semibold border-r border-[var(--border)]">
              Batroun
            </span>
            <span className="px-4 text-sm font-semibold border-r border-[var(--border)]">
              Any week
            </span>
            <span className="px-4 text-sm text-[var(--muted)]">Add guests</span>
            <div className="ml-2 w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center">
              <Icon name="search" size={14} stroke="white" strokeWidth={3} />
            </div>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/list-your-chalet"
              className="hidden lg:block text-sm font-semibold hover:bg-[var(--surface)] rounded-full px-4 py-2.5 transition-colors"
            >
              List your property
            </Link>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full text-[#25D366] hover:bg-[var(--surface)] transition-colors"
              >
                <Icon name="whatsapp" size={20} />
              </a>
            )}
            <UserMenu user={user} />
          </div>
        </div>

        <Link
          href="/chalets"
          className="md:hidden w-full flex items-center gap-3 border border-[var(--border)] rounded-full px-4 py-3 shadow-sm bg-white mb-4"
        >
          <Icon name="search" size={18} strokeWidth={2.5} />
          <div className="text-left">
            <p className="text-sm font-semibold leading-tight">Where to?</p>
            <p className="text-xs text-[var(--muted)] leading-tight mt-0.5">
              Browse chalets in Batroun
            </p>
          </div>
        </Link>
      </Container>
    </header>
  );
}
