import type { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from '@/app/_components/LoginForm'

export const metadata: Metadata = { title: 'Sign in' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const raw = typeof params.redirect === 'string' ? params.redirect : null
  const redirectTo = raw?.startsWith('/') ? raw : '/'

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-sand-50 via-white to-[var(--accent-light)] px-4 py-16">
      <div className="w-full max-w-sm animate-page-in">

        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span className="text-warm-900">Manzeli</span>
          </Link>
          <p className="mt-2 text-sm text-warm-500">
            Sign in to your account
          </p>
        </div>

        <div className="rounded-2xl border border-sand-200 bg-white px-8 py-8 shadow-lg shadow-warm-900/5">
          <h1 className="mb-6 text-xl font-semibold text-warm-900">Welcome back</h1>
          <LoginForm redirectTo={redirectTo} submitLabel="Sign in" />
          <p className="mt-5 text-center text-sm text-warm-500">
            Don&apos;t have an account?{' '}
            <Link
              href={raw ? `/signup?redirect=${encodeURIComponent(raw)}` : '/signup'}
              className="font-medium text-sea-600 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </main>
  )
}
