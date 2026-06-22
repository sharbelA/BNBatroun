'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ''

const inputCls =
  'h-11 w-full rounded-xl border border-[var(--border-light)] bg-white px-4 text-sm text-warm-900 placeholder:text-warm-400 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] disabled:opacity-50'
const btnCls =
  'h-11 w-full rounded-xl bg-[var(--accent)] text-sm font-semibold text-white transition-colors duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${SITE_URL}/reset-password`,
    })

    setLoading(false)

    if (error) {
      // Use a generic message — don't surface Supabase-specific errors
      // that could reveal whether the email is registered.
      setError('Something went wrong. Please try again later.')
      return
    }

    setSent(true)
  }

  // ── Confirmation screen ───────────────────────────────────
  if (sent) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-sand-50 px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-sand-200 bg-white px-6 py-10 sm:px-8 shadow-sm text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1 className="mb-2 text-xl font-semibold text-warm-900">Check your email</h1>
            <p className="text-sm text-warm-500 leading-relaxed">
              If an account exists for{' '}
              <span className="font-medium text-warm-800">{email.trim()}</span>,
              a password reset link has been sent.
            </p>
            <p className="mt-4 text-xs text-warm-400">
              Didn&apos;t receive it? Check your spam folder or{' '}
              <button
                type="button"
                onClick={() => setSent(false)}
                className="text-[var(--accent)] hover:underline"
              >
                try again
              </button>
              .
            </p>
          </div>
          <p className="mt-5 text-center text-sm text-warm-500">
            <Link
              href="/host/login"
              className="font-medium text-[var(--accent)] underline-offset-4 hover:underline"
            >
              ← Back to sign in
            </Link>
          </p>
        </div>
      </main>
    )
  }

  // ── Request form ─────────────────────────────────────────
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-sand-50 px-4 py-16">
      <div className="w-full max-w-sm">

        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-warm-900">
            BNBatroun
          </Link>
          <p className="mt-1 text-sm text-warm-500">Reset your password</p>
        </div>

        <div className="rounded-2xl border border-sand-200 bg-white px-6 py-8 sm:px-8 shadow-sm">
          <h1 className="mb-1 text-xl font-semibold text-warm-900">Forgot password?</h1>
          <p className="mb-6 text-sm text-warm-500">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="fp-email" className="text-sm font-medium text-warm-700">
                Email address
              </label>
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="you@example.com"
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className={btnCls}
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-warm-500">
          Remember your password?{' '}
          <Link
            href="/host/login"
            className="font-medium text-[var(--accent)] underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>

      </div>
    </main>
  )
}
