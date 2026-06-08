export default function HostDashboardLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 md:px-6 md:py-16 animate-pulse">
      <div className="mb-2 h-7 w-44 rounded bg-sand-200" />
      <div className="mb-8 h-4 w-72 rounded bg-sand-100" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
            <div className="aspect-[4/3] w-full bg-sand-100" />
            <div className="flex flex-col gap-2 p-4">
              <div className="h-4 w-32 rounded bg-sand-200" />
              <div className="h-3 w-24 rounded bg-sand-100" />
              <div className="mt-4 h-9 w-full rounded-lg bg-sand-100" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
