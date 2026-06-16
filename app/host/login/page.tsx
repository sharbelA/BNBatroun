import type { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from '@/app/_components/LoginForm'

export const metadata: Metadata = { title: 'Sign in' }

export default function HostLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-sand-50 px-4 py-16">
      <div className="w-full max-w-sm">

        {/* Brand mark */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-sea-700"
          >
            BNBatroun
          </Link>
          <p className="mt-1 text-sm text-warm-500">
            Sign in to manage your chalets
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-sand-200 bg-white px-6 py-8 sm:px-8 shadow-sm">
          <h1 className="mb-6 text-xl font-semibold text-warm-900">
            Welcome back
          </h1>

          <LoginForm redirectTo="/host/dashboard" submitLabel="Sign in" />
        </div>

        <p className="mt-5 text-center text-sm text-warm-500">
          Admin access?{' '}
          <Link
            href="/admin/login"
            className="font-medium text-sea-600 underline-offset-4 hover:underline"
          >
            Admin sign in
          </Link>
        </p>

      </div>
    </main>
  )
}
