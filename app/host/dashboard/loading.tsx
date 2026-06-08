export default function HostDashboardLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 md:px-6 md:py-16 animate-pulse">
      <div className="mb-2 h-7 w-48 rounded" style={{ background: "var(--border-light)" }} />
      <div className="mb-8 h-4 w-80 rounded" style={{ background: "var(--surface)" }} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--border-light)", background: "#fff" }}
          >
            <div className="aspect-[4/3] w-full" style={{ background: "var(--surface)" }} />
            <div className="p-5 space-y-3">
              <div className="h-5 w-40 rounded" style={{ background: "var(--border-light)" }} />
              <div className="h-3 w-24 rounded" style={{ background: "var(--surface)" }} />
              <div className="h-10 w-full rounded-xl" style={{ background: "var(--surface)" }} />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
