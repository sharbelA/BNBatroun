export default function NewHostLoading() {
  return (
    <div className="mx-auto max-w-lg animate-pulse">
      <div className="mb-8 h-4 w-20 rounded bg-sand-200" />
      <div className="mb-2 h-7 w-56 rounded bg-sand-200" />
      <div className="mb-8 h-4 w-80 rounded bg-sand-100" />
      <div className="flex flex-col gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="h-4 w-24 rounded bg-sand-200" />
            <div className="h-10 w-full rounded-xl bg-sand-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
