'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

const inputCls =
  'h-11 w-full rounded-xl border border-[var(--border-light)] bg-white px-4 text-sm text-warm-900 placeholder:text-warm-400 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] disabled:opacity-50'
const btnCls =
  'h-11 w-full rounded-xl bg-[var(--accent)] text-sm font-semibold text-white transition-colors duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)

    // Trigger the recovery email. The email template (configured in Supabase
    // dashboard) should display {{ .Token }} — the 6-digit OTP code — rather
    // than {{ .ConfirmationURL }}, since we verify the code directly.
    const { error: reqError } = await supabase.auth.resetPasswordForEmail(trimmed)

    if (reqError) {
      // Generic message — don't reveal whether the email is registered.
      setError('Something went wrong. Please try again later.')
      setLoading(false)
      return
    }

    // Navigate to the reset page, carrying the email so the OTP form can
    // pre-fill it. Using a query param keeps the flow stateless.
    router.push(`/reset-password?email=${encodeURIComponent(trimmed)}`)
  }

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
            Enter your email and we&apos;ll send you a 6-digit reset code.
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
              {loading ? 'Sending…' : 'Send reset code'}
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
