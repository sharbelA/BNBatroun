/**
 * Header — sticky navigation with search bar and user menu.
 * Airbnb-style: logo | search | user controls.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Icon, Container } from "@/components/ui";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[var(--border-light)]">
      <Container>
        <div className="flex h-[var(--header-height)] items-center justify-between gap-4">
          {/* ── Logo ── */}
          <Logo />

          {/* ── Search bar — desktop ── */}
          <SearchBar />

          {/* ── Right controls ── */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="#"
              className="hidden lg:block text-sm font-semibold hover:bg-[var(--surface)] rounded-full px-4 py-2.5 transition-colors"
            >
              List your property
            </Link>

            {/* User menu trigger */}
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 border border-[var(--border)] rounded-full px-3 py-2 hover:shadow-md transition-shadow duration-200"
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <Icon name="menu" size={16} />
                <div className="w-7 h-7 rounded-full bg-[var(--muted)] flex items-center justify-center">
                  <Icon name="user" size={14} fill="white" stroke="none" />
                </div>
              </button>

              {/* Dropdown */}
              {menuOpen && <UserMenu onClose={() => setMenuOpen(false)} />}
            </div>
          </div>
        </div>

        {/* ── Mobile search ── */}
        <MobileSearchBar />
      </Container>
    </header>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <div className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center">
        <Icon name="home" size={20} stroke="white" fill="none" />
      </div>
      <span className="text-xl font-bold tracking-tight text-[var(--foreground)]">
        Manzeli
      </span>
    </Link>
  );
}

function SearchBar() {
  return (
    <div className="hidden md:flex items-center">
      <button className="flex items-center border border-[var(--border)] rounded-full px-2 py-2 shadow-sm hover:shadow-md transition-shadow duration-200">
        <span className="px-4 text-sm font-semibold border-r border-[var(--border)]">
          Anywhere
        </span>
        <span className="px-4 text-sm font-semibold border-r border-[var(--border)]">
          Any week
        </span>
        <span className="px-4 text-sm text-[var(--muted)]">Add guests</span>
        <div className="ml-2 w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center">
          <Icon name="search" size={14} stroke="white" strokeWidth={3} />
        </div>
      </button>
    </div>
  );
}

function MobileSearchBar() {
  return (
    <div className="md:hidden pb-4">
      <button className="w-full flex items-center gap-3 border border-[var(--border)] rounded-full px-4 py-3 shadow-sm bg-white">
        <Icon name="search" size={18} strokeWidth={2.5} />
        <div className="text-left">
          <p className="text-sm font-semibold leading-tight">Where to?</p>
          <p className="text-xs text-[var(--muted)] leading-tight mt-0.5">
            Anywhere · Any week · Add guests
          </p>
        </div>
      </button>
    </div>
  );
}

function UserMenu({ onClose }: { onClose: () => void }) {
  const items = [
    { label: "Sign up", href: "#", bold: true },
    { label: "Log in", href: "#" },
    { divider: true },
    { label: "List your property", href: "#" },
    { label: "Help", href: "#" },
  ] as const;

  return (
    <div className="absolute right-0 top-[calc(100%+8px)] bg-white border border-[var(--border-light)] rounded-xl shadow-lg py-2 w-60 z-50">
      {items.map((item, i) =>
        "divider" in item ? (
          <div
            key={i}
            className="border-t border-[var(--border-light)] my-1"
          />
        ) : (
          <Link
            key={i}
            href={item.href}
            onClick={onClose}
            className={`block px-4 py-2.5 text-sm hover:bg-[var(--surface)] transition-colors ${
              "bold" in item && item.bold ? "font-semibold" : ""
            }`}
          >
            {item.label}
          </Link>
        )
      )}
    </div>
  );
}
