import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default function HostDashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-sand-50 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-warm-900">Host dashboard</h1>
        <p className="mt-2 text-sm text-warm-500">Coming soon.</p>
      </div>
    </main>
  )
}
