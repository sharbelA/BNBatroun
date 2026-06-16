'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function HostShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  // Login page gets no shell — bare layout
  if (pathname === '/host/login') return <>{children}</>

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/host/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface, #f7f7f7)' }}>
      {/* Top bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: '#fff',
          borderBottom: '1px solid var(--border-light, #ebebeb)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 16px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Left: logo + nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Home button */}
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--foreground)',
                  letterSpacing: '-0.01em',
                }}
              >
                BNBatroun
              </span>
            </Link>

            {/* Dashboard link */}
            <Link
              href="/host/dashboard"
              style={{
                fontSize: '14px',
                fontWeight: pathname === '/host/dashboard' ? 600 : 500,
                color: pathname === '/host/dashboard' ? 'var(--accent)' : 'var(--muted)',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
            >
              My chalets
            </Link>
          </div>

          {/* Right: sign out */}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface, #f7f7f7)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  )
}
