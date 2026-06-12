'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { Role } from '@/lib/supabase/types'

interface Props {
  /** Where to push on successful authentication */
  redirectTo: string
  /** If set, the signed-in user must have this role or they are signed out immediately */
  requiredRole?: Role
  submitLabel?: string
}

export default function LoginForm({
  redirectTo,
  requiredRole,
  submitLabel = 'Sign in',
}: Props) {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)



    // 1. Authenticate
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // 2. Verify role if the portal requires one
    if (requiredRole) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profileError || profile?.role !== requiredRole) {
        await supabase.auth.signOut()
        setError('Access denied. You do not have permission for this portal.')
        setLoading(false)
        return
      }
    }

    // 3. Navigate — router.refresh() syncs server-component session state
    router.push(redirectTo)
    router.refresh()
  }

  return (
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
        <label htmlFor="lf-email" className="text-sm font-medium text-warm-700">
          Email address
        </label>
        <input
          id="lf-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          placeholder="you@example.com"
          className="h-11 rounded-xl border border-[var(--border-light)] bg-white px-4 text-sm text-warm-900 placeholder:text-warm-400 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="lf-password" className="text-sm font-medium text-warm-700">
          Password
        </label>
        <input
          id="lf-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          placeholder="••••••••"
          className="h-11 rounded-xl border border-[var(--border-light)] bg-white px-4 text-sm text-warm-900 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !email || !password}
        className="mt-1 h-11 rounded-xl bg-[var(--accent)] text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--accent-hover)] active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? 'Signing in…' : submitLabel}
      </button>
    </form>
  )
}
