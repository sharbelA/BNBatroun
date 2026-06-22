'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type Phase = 'form' | 'submitting' | 'done'

const inputCls =
  'h-11 w-full rounded-xl border border-[var(--border-light)] bg-white px-4 text-sm text-warm-900 placeholder:text-warm-400 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] disabled:opacity-50'
const btnCls =
  'h-11 w-full rounded-xl bg-[var(--accent)] text-sm font-semibold text-white transition-colors duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('form')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Pre-fill email from ?email= query param (set by the forgot-password page).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const e = params.get('email')
    if (e) setEmail(decodeURIComponent(e))
  }, [])

  // Auto-redirect to host login 3 s after a successful update.
  useEffect(() => {
    if (phase !== 'done') return
    const t = setTimeout(() => router.push('/host/login'), 3000)
    return () => clearTimeout(t)
  }, [phase, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()
    const trimmedCode  = code.trim()

    // ── Validation ────────────────────────────────────────────
    if (!trimmedEmail) {
      setError('Please enter your email address.')
      return
    }
    if (!/^\d{6}$/.test(trimmedCode)) {
      setError('Please enter the 6-digit code from your email.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setPhase('submitting')

    // ── Step 1: verify the OTP ────────────────────────────────
    // verifyOtp with type:'recovery' validates the 6-digit code sent by
    // resetPasswordForEmail and establishes a session on success.
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: trimmedEmail,
      token: trimmedCode,
      type: 'recovery',
    })

    if (otpError) {
      setError('Invalid or expired code. Request a new one.')
      setPhase('form')
      return
    }

    // ── Step 2: set the new password ──────────────────────────
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setPhase('form')
      return
    }

    // Clear the recovery session so the user logs in fresh.
    await supabase.auth.signOut()
    setPhase('done')
  }

  // ── Done screen ───────────────────────────────────────────
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
              className="mt-5 inline-block text-sm font-medium text-[var(--accent)] hover:underline"
            >
              Go to sign in
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // ── OTP + new password form ───────────────────────────────
  const submitting = phase === 'submitting'

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
          <h1 className="mb-1 text-xl font-semibold text-warm-900">Enter your reset code</h1>
          <p className="mb-6 text-sm text-warm-500">
            Check your email for the 6-digit code and choose a new password.
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {/* Email — pre-filled from query param, editable in case user
                navigates here directly without the param */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rp-email" className="text-sm font-medium text-warm-700">
                Email address
              </label>
              <input
                id="rp-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                placeholder="you@example.com"
                className={inputCls}
              />
            </div>

            {/* 6-digit OTP */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rp-code" className="text-sm font-medium text-warm-700">
                Reset code
              </label>
              <input
                id="rp-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={submitting}
                placeholder="123456"
                className={`${inputCls} text-center text-xl tracking-[0.4em] font-mono`}
              />
            </div>

            {/* New password */}
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

            {/* Confirm password */}
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
              disabled={submitting || !email.trim() || code.length !== 6 || !password || !confirm}
              className={btnCls}
            >
              {submitting ? 'Verifying…' : 'Update password'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-warm-500">
          Didn&apos;t receive a code?{' '}
          <Link
            href="/forgot-password"
            className="font-medium text-[var(--accent)] underline-offset-4 hover:underline"
          >
            Request a new one
          </Link>
        </p>

      </div>
    </main>
  )
}
