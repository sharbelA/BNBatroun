export default function AdminAvailabilityLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse">
      <div className="mb-8 h-4 w-24 rounded" style={{ background: "var(--border-light)" }} />
      <div className="mb-2 h-7 w-72 rounded" style={{ background: "var(--border-light)" }} />
      <div className="mb-8 h-4 w-96 max-w-full rounded" style={{ background: "var(--surface)" }} />
      <div className="h-96 w-full rounded-2xl" style={{ border: "1px solid var(--border-light)", background: "#fff" }} />
    </div>
  )
}
