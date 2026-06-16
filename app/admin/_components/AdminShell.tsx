'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Icon } from '@/components/ui'

const NAV = [
  { href: '/admin/dashboard', label: 'Overview' },
  { href: '/admin/listings', label: 'Chalets' },
  { href: '/admin/hosts',    label: 'Hosts' },
  { href: '/admin/users',    label: 'Users' },
  { href: '/admin/reviews',  label: 'Reviews' },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Login page gets no shell chrome — bare layout only
  if (pathname === '/admin/login') return <>{children}</>

  // Close the drawer whenever the route changes
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  async function handleSignOut() {
    setSigningOut(true)

    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  function isActive(href: string) {
    return href === '/admin/dashboard'
      ? pathname === '/admin/dashboard'
      : pathname.startsWith(href)
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">

      {/* ── Mobile top bar ──────────────────────── */}
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-warm-700 bg-warm-900 px-4 md:hidden">
        <Link href="/" className="text-lg font-bold tracking-tight text-sand-50">
          BNBatroun
        </Link>
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="flex h-11 w-11 items-center justify-center text-sand-50"
        >
          <Icon name="menu" size={22} />
        </button>
      </header>

      {/* ── Mobile drawer ───────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 max-w-[80vw] flex-col bg-warm-900 px-4 py-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <Link
                  href="/"
                  className="block text-lg font-bold tracking-tight text-sand-50"
                  onClick={() => setDrawerOpen(false)}
                >
                  BNBatroun
                </Link>
                <span className="text-xs font-semibold uppercase tracking-widest text-warm-500">
                  Admin
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center text-warm-400"
              >
                <Icon name="x" size={22} />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium transition-colors ${
                    isActive(href)
                      ? 'bg-warm-700 text-sand-50'
                      : 'text-warm-400 hover:bg-warm-800 hover:text-sand-100'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex min-h-[44px] w-full items-center rounded-lg px-3 text-left text-sm font-medium text-warm-500 transition-colors hover:text-warm-300 disabled:opacity-50"
              >
                {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Desktop sidebar ─────────────────────── */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-warm-700 bg-warm-900 px-4 py-8 md:flex">
        <Link
          href="/"
          className="mb-1 block text-lg font-bold tracking-tight text-sand-50"
        >
          BNBatroun
        </Link>
        <span className="mb-8 text-xs font-semibold uppercase tracking-widest text-warm-500">
          Admin
        </span>

        <nav className="flex flex-col gap-0.5">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(href)
                  ? 'bg-warm-700 text-sand-50'
                  : 'text-warm-400 hover:bg-warm-800 hover:text-sand-100'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-warm-500 transition-colors hover:text-warm-300 disabled:opacity-50"
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="hidden h-14 shrink-0 items-center border-b border-sand-200 bg-white px-8 md:flex">
          <span className="text-sm font-medium text-warm-400">Admin</span>
        </header>
        <main className="flex-1 overflow-auto bg-sand-50 px-4 py-6 md:px-10 md:py-8">
          {children}
        </main>
      </div>

    </div>
  )
}
