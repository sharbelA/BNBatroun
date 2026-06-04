import type { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from '@/app/_components/LoginForm'

export const metadata: Metadata = { title: 'Admin sign in' }

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-warm-900 px-4 py-16">
      <div className="w-full max-w-sm">

        {/* Brand mark */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-sand-100"
          >
            Manzeli
          </Link>
          <p className="mt-1 text-sm text-warm-400">Admin portal</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-warm-700 bg-warm-800 px-8 py-8">
          <h1 className="mb-1 text-xl font-semibold text-sand-50">
            Admin sign in
          </h1>
          <p className="mb-6 text-sm text-warm-400">
            Restricted to authorized administrators.
          </p>

          <LoginForm
            redirectTo="/admin/dashboard"
            requiredRole="admin"
            submitLabel="Sign in to admin"
          />
        </div>

        <p className="mt-5 text-center text-sm text-warm-500">
          Not an admin?{' '}
          <Link
            href="/host/login"
            className="font-medium text-sand-300 underline-offset-4 hover:underline"
          >
            Host sign in
          </Link>
        </p>

      </div>
    </main>
  )
}
