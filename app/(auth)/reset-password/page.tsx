'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { AuthChangeEvent, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

type Phase = 'loading' | 'form' | 'done' | 'expired'

const inputCls =
  'h-11 w-full rounded-xl border border-[var(--border-light)] bg-white px-4 text-sm text-warm-900 placeholder:text-warm-400 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] disabled:opacity-50'
const btnCls =
  'h-11 w-full rounded-xl bg-[var(--accent)] text-sm font-semibold text-white transition-colors duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const resolvedRef = useRef(false) // prevent multiple phase transitions

  function resolve(next: Phase) {
    if (!resolvedRef.current) {
      resolvedRef.current = true
      setPhase(next)
    }
  }

  useEffect(() => {
    // Supabase appends auth data to the URL. It uses the HASH fragment (#), not
    // the query string, for both success tokens and error codes. Parse both.
    const search = new URLSearchParams(window.location.search)
    const hash = new URLSearchParams(window.location.hash.slice(1))

    // ── Error case ────────────────────────────────────────────
    // Supabase sends expired/invalid links as:
    //   #error=access_denied&error_code=otp_expired&error_description=...
    // or occasionally as query params.
    const hasError =
      hash.get('error') || search.get('error') ||
      hash.get('error_code') || search.get('error_code')

    if (hasError) {
      resolve('expired')
      return
    }

    // ── Success case ──────────────────────────────────────────
    // Supabase sends valid recovery links with ONE of these patterns:
    //   #access_token=...&type=recovery   (implicit / non-PKCE)
    //   ?type=recovery&token_hash=...     (PKCE flow used by @supabase/ssr)
    const hasRecoverySignal =
      hash.get('access_token') ||
      hash.get('type') === 'recovery' ||
      search.get('type') === 'recovery' ||
      search.get('token_hash')

    if (!hasRecoverySignal) {
      // No recovery signal at all — direct navigation or unknown URL shape.
      resolve('expired')
      return
    }

    // Subscribe BEFORE calling getSession so we don't miss the event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent) => {
        if (event === 'PASSWORD_RECOVERY') {
          resolve('form')
        }
      }
    )

    // Fallback: the browser client may have already processed the URL params
    // before this effect ran (the client is a singleton). getSession() returns
    // the already-established recovery session in that case.
    supabase.auth.getSession().then(
      (result: { data: { session: Session | null }; error: AuthError | null }) => {
        if (result.data.session) {
          resolve('form')
        }
      }
    )

    // Final timeout: if neither the event nor getSession yields a session
    // within 4 s, treat the token as expired.
    const timer = setTimeout(() => resolve('expired'), 4000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  // Auto-redirect to host login 3 s after password is updated
  useEffect(() => {
    if (phase !== 'done') return
    const t = setTimeout(() => router.push('/host/login'), 3000)
    return () => clearTimeout(t)
  }, [phase, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setFormError('Passwords do not match.'); return }
    if (password.length < 6) { setFormError('Password must be at least 6 characters.'); return }
    setFormError(null)
    setSubmitting(true)

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setFormError(error.message)
      setSubmitting(false)
      return
    }

    setPhase('done')
    await supabase.auth.signOut()
  }

  // ── Loading ───────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sand-50">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-sand-200 border-t-[var(--accent)]" />
      </main>
    )
  }

  // ── Expired / invalid ─────────────────────────────────────
  if (phase === 'expired') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-sand-50 px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-sand-200 bg-white px-6 py-10 sm:px-8 shadow-sm text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="mb-2 text-xl font-semibold text-warm-900">
              Reset link expired
            </h1>
            <p className="text-sm text-warm-500 leading-relaxed">
              This password reset link is invalid or has expired. Links are
              valid for 1 hour. Please request a new one.
            </p>
            <Link
              href="/forgot-password"
              className="mt-6 inline-block rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Request a new link
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // ── Done ─────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-sand-50 px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-sand-200 bg-white px-6 py-10 sm:px-8 shadow-sm text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1 className="mb-2 text-xl font-semibold text-warm-900">Password updated!</h1>
            <p className="text-sm text-warm-500">
              You can now log in with your new password. Redirecting you now…
            </p>
            <Link
              href="/host/login"
              className="mt-6 inline-block text-sm font-medium text-[var(--accent)] hover:underline"
            >
              Go to sign in
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // ── New password form ─────────────────────────────────────
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-sand-50 px-4 py-16">
      <div className="w-full max-w-sm">

        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-warm-900">
            BNBatroun
          </Link>
        </div>

        <div className="rounded-2xl border border-sand-200 bg-white px-6 py-8 sm:px-8 shadow-sm">
          <h1 className="mb-1 text-xl font-semibold text-warm-900">Set new password</h1>
          <p className="mb-6 text-sm text-warm-500">
            Choose a strong password — at least 6 characters.
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {formError && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="rp-password" className="text-sm font-medium text-warm-700">
                New password
              </label>
              <input
                id="rp-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                placeholder="••••••••"
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="rp-confirm" className="text-sm font-medium text-warm-700">
                Confirm new password
              </label>
              <input
                id="rp-confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={submitting}
                placeholder="••••••••"
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !password || !confirm}
              className={btnCls}
            >
              {submitting ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>

      </div>
    </main>
  )
}
