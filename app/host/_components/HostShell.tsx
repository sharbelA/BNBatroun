'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function HostShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  if (pathname === '/host/login') return <>{children}</>

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/host/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface)]">

      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-[var(--border-light)]">
        <div className="mx-auto max-w-[1200px] px-4 h-[60px] flex items-center justify-between gap-4">

          {/* Left: logo + nav */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-[34px] h-[34px] rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="text-[17px] font-semibold tracking-tight text-[var(--foreground)]">
                BNBatroun
              </span>
            </Link>

            <Link
              href="/host/dashboard"
              className={`text-sm font-medium transition-colors ${
                pathname === '/host/dashboard'
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              My chalets
            </Link>
          </div>

          {/* Right: sign out */}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
