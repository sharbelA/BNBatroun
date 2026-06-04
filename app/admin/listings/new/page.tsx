import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'New chalet' }

const AMENITIES: { name: string; label: string }[] = [
  { name: 'wifi',          label: 'WiFi' },
  { name: 'pool',          label: 'Pool' },
  { name: 'parking',       label: 'Parking' },
  { name: 'ac',            label: 'AC' },
  { name: 'bbq',           label: 'BBQ' },
  { name: 'sea_view',      label: 'Sea view' },
  { name: 'mountain_view', label: 'Mountain view' },
  { name: 'pet_friendly',  label: 'Pet friendly' },
]

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-2xl">

      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/listings"
          className="text-sm text-warm-500 hover:text-warm-900 transition-colors"
        >
          ← All chalets
        </Link>
      </div>

      <h1 className="mb-8 text-2xl font-semibold text-warm-900">New chalet</h1>

      {/* TODO: wire up to a Server Action that calls supabase.from('listings').insert(...) */}
      <form className="flex flex-col gap-8">

        {/* ── Basic info ─────────────────────────── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-warm-500">
            Basic info
          </h2>

          <Field label="Title" htmlFor="title">
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g. Sunset Villa Batroun"
              className={inputCls}
            />
          </Field>

          <Field
            label="Slug"
            htmlFor="slug"
            hint="URL-safe identifier, auto-generated from title in production"
          >
            <input
              id="slug"
              name="slug"
              type="text"
              required
              placeholder="sunset-villa-batroun"
              className={inputCls}
            />
          </Field>

          <Field label="Location" htmlFor="location">
            <input
              id="location"
              name="location"
              type="text"
              required
              placeholder="e.g. Batroun, North Lebanon"
              className={inputCls}
            />
          </Field>

          <Field label="Description" htmlFor="description">
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              placeholder="Describe the chalet — views, feel, highlights…"
              className={`${inputCls} resize-none py-3`}
            />
          </Field>
        </section>

        {/* ── Pricing & capacity ─────────────────── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-warm-500">
            Pricing &amp; capacity
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Price / night ($)" htmlFor="price">
              <input
                id="price"
                name="price"
                type="number"
                min={1}
                step="0.01"
                required
                className={inputCls}
              />
            </Field>
            <Field label="Bedrooms" htmlFor="bedrooms">
              <input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min={0}
                defaultValue={1}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Bathrooms" htmlFor="bathrooms">
              <input
                id="bathrooms"
                name="bathrooms"
                type="number"
                min={0}
                defaultValue={1}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Max guests" htmlFor="max_guests">
              <input
                id="max_guests"
                name="max_guests"
                type="number"
                min={1}
                defaultValue={2}
                required
                className={inputCls}
              />
            </Field>
          </div>
        </section>

        {/* ── Amenities ──────────────────────────── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-warm-500">
            Amenities
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {AMENITIES.map(({ name, label }) => (
              <label
                key={name}
                className="flex cursor-pointer items-center gap-2 text-sm text-warm-700"
              >
                <input
                  type="checkbox"
                  name={name}
                  className="h-4 w-4 rounded border-sand-300 accent-sea-600"
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        {/* ── House rules ────────────────────────── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-warm-500">
            House rules
          </h2>
          <Field
            label="Rules"
            htmlFor="house_rules"
            hint="One rule per line — saved as an array"
          >
            <textarea
              id="house_rules"
              name="house_rules"
              rows={4}
              placeholder={"No smoking\nNo parties\nCheck-out by 11 AM"}
              className={`${inputCls} resize-none py-3`}
            />
          </Field>
        </section>

        {/* ── Settings ───────────────────────────── */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-warm-500">
            Settings
          </h2>
          <label className="flex cursor-pointer items-center gap-3 text-sm text-warm-700">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked
              className="h-4 w-4 rounded border-sand-300 accent-sea-600"
            />
            Active (visible to guests)
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm text-warm-700">
            <input
              type="checkbox"
              name="is_featured"
              className="h-4 w-4 rounded border-sand-300 accent-sea-600"
            />
            Featured (shown on home page)
          </label>
        </section>

        {/* ── Actions ────────────────────────────── */}
        <div className="flex gap-3 border-t border-sand-200 pt-6">
          <button
            type="submit"
            className="h-10 rounded-lg bg-sea-600 px-6 text-sm font-semibold text-white transition hover:bg-sea-700 active:scale-[0.98]"
          >
            Create chalet
          </button>
          <Link
            href="/admin/listings"
            className="inline-flex h-10 items-center rounded-lg border border-sand-200 px-6 text-sm font-medium text-warm-700 transition hover:bg-sand-50"
          >
            Cancel
          </Link>
        </div>

      </form>
    </div>
  )
}

/* ── Small helpers ─────────────────────────────────────────────────────── */

const inputCls =
  'h-10 w-full rounded-xl border border-sand-200 bg-white px-4 text-sm text-warm-900 placeholder:text-warm-400 outline-none transition focus:border-sea-400 focus:ring-2 focus:ring-sea-100'

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-warm-700">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-warm-400">{hint}</p>}
    </div>
  )
}
