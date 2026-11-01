"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Profile } from "@/lib/supabase/types";
import type { AdminListing } from "@/lib/supabase/queries/admin";
import {
  createListingAction,
  updateListingAction,
  type ActionState,
} from "@/app/_actions/listings";
import {
  BATROUN_AREAS,
  LISTING_TYPE_META,
  PRICE_PERIODS,
  PROPERTY_KINDS,
  type ListingTypeKey,
} from "@/lib/constants";

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
  listing?: AdminListing | null;
  hosts?: Pick<Profile, "id" | "name" | "role">[];
  mode: "create" | "edit";
  /** Which kind of listing this form manages. Defaults to the listing's own type, else daily. */
  type?: ListingTypeKey;
}

const initial: ActionState = { error: null };

export default function ListingForm({
  listing,
  hosts,
  mode,
  type,
}: ListingFormProps) {
  const listingType: ListingTypeKey = listing?.listing_type ?? type ?? "daily";
  const isDaily = listingType === "daily";
  const isSeasonal = listingType === "seasonal";
  const isSale = listingType === "sale";
  const noun = LISTING_TYPE_META[listingType].adminLabel;
  const action = mode === "create" ? createListingAction : updateListingAction;
  const [state, formAction, isPending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {/* Hidden ID for edit mode */}
      {listing?.id && <input type="hidden" name="id" value={listing.id} />}
      <input type="hidden" name="listing_type" value={listingType} />

      {/* Error / success messages */}
      {state.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          {state.message ?? "Changes saved successfully."}
        </div>
      )}

      {/* ── Host selector ─────────────────────── */}
      {hosts && hosts.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-warm-500">
            Host
          </h2>
          {mode === "edit" && listing?.host_name && (
            <p className="text-xs text-warm-500">
              Currently assigned to{" "}
              <span className="font-semibold text-warm-800">
                {listing.host_name}
              </span>
            </p>
          )}
          <Field
            label={mode === "edit" ? "Reassign to host" : "Assign to host"}
            htmlFor="host_id"
          >
            <select
              id="host_id"
              name="host_id"
              className={inputCls}
              defaultValue={listing?.host_id ?? ""}
            >
              {mode === "create" && <option value="">Me (admin)</option>}
              {hosts.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                  {h.role === "admin" ? " (Admin)" : ""}
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
            placeholder={
              isSale
                ? "e.g. Sea-view apartment in Batroun"
                : isSeasonal
                  ? "e.g. Furnished chalet for the summer season"
                  : "e.g. Sunset Villa Batroun"
            }
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

        <Field
          label="Internal name (admin only)"
          htmlFor="internal_name"
          hint="Only visible to admins — use the real chalet name"
        >
          <input
            id="internal_name"
            name="internal_name"
            type="text"
            defaultValue={listing?.internal_name ?? ""}
            placeholder="e.g. Villa Sarkis - Edde"
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
            placeholder={
              isSale
                ? "Describe the property — size, condition, views, what's included…"
                : isSeasonal
                  ? "Describe the rental — furnishing, season dates, what's included…"
                  : "Describe the chalet — views, feel, highlights…"
            }
            className={`${inputCls} resize-none py-3 !h-auto`}
          />
        </Field>
      </section>

      {/* ── Pricing & capacity ─────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-warm-500">
          {isDaily ? "Pricing & capacity" : isSale ? "Price & details" : "Rent & details"}
        </h2>
        {isDaily ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Weekday price ($)" htmlFor="price" hint="Mon–Thu">
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
            <Field label="Weekend price ($)" htmlFor="weekend_price" hint="Fri–Sun">
              <input
                id="weekend_price"
                name="weekend_price"
                type="number"
                min={1}
                step="1"
                required
                defaultValue={listing?.weekend_price ?? listing?.price ?? ""}
                className={inputCls}
              />
            </Field>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label={LISTING_TYPE_META[listingType].priceLabel}
              htmlFor="price"
              hint={isSale ? "One-time asking price" : "Rent for the period selected"}
            >
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
            {isSeasonal && (
              <Field label="Rent period" htmlFor="price_period">
                <select
                  id="price_period"
                  name="price_period"
                  defaultValue={listing?.price_period ?? "month"}
                  className={inputCls}
                >
                  {PRICE_PERIODS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            {isSale && (
              <Field label="Property type" htmlFor="property_kind">
                <select
                  id="property_kind"
                  name="property_kind"
                  defaultValue={listing?.property_kind ?? "apartment"}
                  className={inputCls}
                >
                  {PROPERTY_KINDS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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
          {isDaily ? (
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
          ) : (
            <Field label="Area (m²)" htmlFor="area_sqm">
              <input
                id="area_sqm"
                name="area_sqm"
                type="number"
                min={1}
                step="1"
                defaultValue={listing?.area_sqm ?? ""}
                placeholder="e.g. 120"
                className={inputCls}
              />
            </Field>
          )}
          {isDaily && (
            <>
              <Field label="Guests included in base price" htmlFor="base_guests" hint="Extra guests are charged separately">
                <input
                  id="base_guests"
                  name="base_guests"
                  type="number"
                  min={1}
                  required
                  defaultValue={listing?.base_guests ?? listing?.max_guests ?? 2}
                  className={inputCls}
                />
              </Field>
              <Field label="Extra guest fee ($/night)" htmlFor="price_per_extra_guest" hint="0 = no extra charge">
                <input
                  id="price_per_extra_guest"
                  name="price_per_extra_guest"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={listing?.price_per_extra_guest ?? 0}
                  className={inputCls}
                />
              </Field>
            </>
          )}
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

      {isDaily && (
        <>
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
        </>
      )}

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
          {isDaily ? "Featured (shown on home page)" : "Featured (highlighted in its section)"}
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
              ? `Create ${noun}`
              : "Save changes"}
        </button>
        <Link
          href={`/admin/listings?type=${listingType}`}
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
