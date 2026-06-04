'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin/dashboard', label: 'Overview' },
  { href: '/admin/listings', label: 'Chalets' },
  { href: '/admin/hosts',    label: 'Hosts' },
  { href: '/admin/users',    label: 'Users' },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  // Login page gets no shell chrome — bare layout only
  if (pathname === '/admin/login') return <>{children}</>

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Sidebar ─────────────────────────────── */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-warm-700 bg-warm-900 px-4 py-8">
        <Link
          href="/"
          className="mb-1 block text-lg font-bold tracking-tight text-sand-50"
        >
          Manzeli
        </Link>
        <span className="mb-8 text-xs font-semibold uppercase tracking-widest text-warm-500">
          Admin
        </span>

        <nav className="flex flex-col gap-0.5">
          {NAV.map(({ href, label }) => {
            const active =
              href === '/admin/dashboard'
                ? pathname === '/admin/dashboard'
                : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-warm-700 text-sand-50'
                    : 'text-warm-400 hover:bg-warm-800 hover:text-sand-100'
                }`}
              >
                {label}
              </Link>
            )
          })}
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
        <header className="flex h-14 shrink-0 items-center border-b border-sand-200 bg-white px-8">
          <span className="text-sm font-medium text-warm-400">Admin</span>
        </header>
        <main className="flex-1 overflow-auto bg-sand-50 px-6 py-8 md:px-10">
          {children}
        </main>
      </div>

    </div>
  )
}
