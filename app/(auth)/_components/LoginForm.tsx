'use client'

import { useActionState } from 'react'
import { loginAction } from '@/app/_actions/auth'

type State = { error: string | null }
const initial: State = { error: null }

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initial)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-warm-700">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isPending}
          className="h-11 rounded-xl border border-sand-200 bg-white px-4 text-sm text-warm-900 placeholder-warm-400 outline-none transition focus:border-sea-400 focus:ring-2 focus:ring-sea-100 disabled:opacity-60"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-warm-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isPending}
          className="h-11 rounded-xl border border-sand-200 bg-white px-4 text-sm text-warm-900 outline-none transition focus:border-sea-400 focus:ring-2 focus:ring-sea-100 disabled:opacity-60"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-1 h-11 rounded-xl bg-sea-600 text-sm font-semibold text-white transition hover:bg-sea-700 disabled:opacity-60"
      >
        {isPending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
