export default function HostAvailabilityLoading() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 md:py-16 animate-pulse">
      <div className="mb-8 h-4 w-32 rounded" style={{ background: "var(--border-light)" }} />
      <div className="mb-2 h-7 w-72 rounded" style={{ background: "var(--border-light)" }} />
      <div className="mb-8 h-4 w-96 rounded" style={{ background: "var(--surface)" }} />
      <div className="h-96 w-full rounded-2xl border" style={{ borderColor: "var(--border-light)", background: "#fff" }} />
    </main>
  )
}
