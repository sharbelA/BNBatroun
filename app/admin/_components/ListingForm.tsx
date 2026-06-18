"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Listing, Profile } from "@/lib/supabase/types";
import {
  createListingAction,
  updateListingAction,
  type ActionState,
} from "@/app/_actions/listings";
import { BATROUN_AREAS } from "@/lib/constants";

const AMENITIES = [
  { name: "wifi", label: "WiFi" },
  { name: "pool", label: "Pool" },
  { name: "parking", label: "Parking" },
  { name: "ac", label: "AC" },
  { name: "bbq", label: "BBQ" },
  { name: "sea_view", label: "Sea view" },
  { name: "mountain_view", label: "Mountain view" },
  { name: "pet_friendly", label: "Pet friendly" },
] as const;

interface ListingFormProps {
  listing?: Listing | null;
  hosts?: Pick<Profile, "id" | "name">[];
  mode: "create" | "edit";
}

const initial: ActionState = { error: null };

export default function ListingForm({
  listing,
  hosts,
  mode,
}: ListingFormProps) {
  const action = mode === "create" ? createListingAction : updateListingAction;
  const [state, formAction, isPending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {/* Hidden ID for edit mode */}
      {listing?.id && <input type="hidden" name="id" value={listing.id} />}

      {/* Error / success messages */}
      {state.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          Changes saved successfully.
        </div>
      )}

      {/* ── Host selector (create only) ─────────── */}
      {mode === "create" && hosts && hosts.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-warm-500">
            Host
          </h2>
          <Field label="Assign to host" htmlFor="host_id">
            <select
              id="host_id"
              name="host_id"
              className={inputCls}
              defaultValue=""
            >
              <option value="">Me (admin)</option>
              {hosts.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </Field>
        </section>
      )}

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
            defaultValue={listing?.title ?? ""}
            placeholder="e.g. Sunset Villa Batroun"
            className={inputCls}
          />
        </Field>

        <Field
          label="Slug"
          htmlFor="slug"
          hint={
            mode === "edit"
              ? "Changing the slug breaks existing links"
              : "Auto-generated from title if left empty"
          }
        >
          <input
            id="slug"
            name="slug"
            type="text"
            defaultValue={listing?.slug ?? ""}
            placeholder="sunset-villa-batroun"
            className={inputCls}
          />
        </Field>

        <Field label="Area" htmlFor="location">
          <select
            id="location"
            name="location"
            required
            defaultValue={listing?.location ?? "Batroun City"}
            className={inputCls}
          >
            {BATROUN_AREAS.map((a) => (
              <option key={a.slug} value={a.name}>
                {a.emoji} {a.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Description" htmlFor="description">
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            defaultValue={listing?.description ?? ""}
            placeholder="Describe the chalet — views, feel, highlights…"
            className={`${inputCls} resize-none py-3 !h-auto`}
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
              step="1"
              required
              defaultValue={listing?.price ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Bedrooms" htmlFor="bedrooms">
            <input
              id="bedrooms"
              name="bedrooms"
              type="number"
              min={0}
              required
              defaultValue={listing?.bedrooms ?? 1}
              className={inputCls}
            />
          </Field>
          <Field label="Bathrooms" htmlFor="bathrooms">
            <input
              id="bathrooms"
              name="bathrooms"
              type="number"
              min={0}
              required
              defaultValue={listing?.bathrooms ?? 1}
              className={inputCls}
            />
          </Field>
          <Field label="Max guests" htmlFor="max_guests">
            <input
              id="max_guests"
              name="max_guests"
              type="number"
              min={1}
              required
              defaultValue={listing?.max_guests ?? 2}
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
                defaultChecked={
                  listing
                    ? !!(listing as Record<string, unknown>)[name]
                    : false
                }
                className="h-4 w-4 rounded border-sand-300 accent-sea-600"
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      {/* ── Location coordinates ─────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-warm-500">
          Map location
        </h2>
        <p className="text-xs text-warm-400">
          Right-click on Google Maps → &quot;What&apos;s here?&quot; to get coordinates
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Latitude" htmlFor="latitude">
            <input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              defaultValue={listing?.latitude ?? ""}
              placeholder="34.2554"
              className={inputCls}
            />
          </Field>
          <Field label="Longitude" htmlFor="longitude">
            <input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              defaultValue={listing?.longitude ?? ""}
              placeholder="35.6581"
              className={inputCls}
            />
          </Field>
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
          hint="One rule per line"
        >
          <textarea
            id="house_rules"
            name="house_rules"
            rows={4}
            defaultValue={listing?.house_rules?.join("\n") ?? ""}
            placeholder={"No smoking\nNo parties\nCheck-out by 11 AM"}
            className={`${inputCls} resize-none py-3 !h-auto`}
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
            defaultChecked={listing?.is_active ?? true}
            className="h-4 w-4 rounded border-sand-300 accent-sea-600"
          />
          Active (visible to guests)
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-warm-700">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={listing?.is_featured ?? false}
            className="h-4 w-4 rounded border-sand-300 accent-sea-600"
          />
          Featured (shown on home page)
        </label>
      </section>

      {/* ── Actions ────────────────────────────── */}
      <div className="flex gap-3 border-t border-sand-200 pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="h-11 md:h-10 rounded-lg bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {isPending
            ? "Saving…"
            : mode === "create"
              ? "Create chalet"
              : "Save changes"}
        </button>
        <Link
          href="/admin/listings"
          className="inline-flex h-11 md:h-10 items-center rounded-lg border border-sand-200 px-6 text-sm font-medium text-warm-700 transition hover:bg-sand-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

// ─── Helpers ────────────────────────────────────────────────

const inputCls =
  "h-11 md:h-10 w-full rounded-xl border border-sand-200 bg-white px-4 text-sm text-warm-900 placeholder:text-warm-400 outline-none transition focus:border-sea-400 focus:ring-2 focus:ring-sea-100";

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-warm-700">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-warm-400">{hint}</p>}
    </div>
  );
}
