"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createHostAction } from "@/app/_actions/admin";
import type { ActionState } from "@/app/_actions/listings";

const initial: ActionState = { error: null };

function generatePassword() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export default function CreateHostForm() {
  const [state, formAction, isPending] = useActionState(
    createHostAction,
    initial
  );
  const [password, setPassword] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Field label="Full name" htmlFor="name">
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. Maya Khoury"
          className={inputCls}
        />
      </Field>

      <Field label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="maya@example.com"
          className={inputCls}
        />
      </Field>

      <Field
        label="Password"
        htmlFor="password"
        hint="At least 6 characters. Generate one or set it manually."
      >
        <div className="flex gap-2">
          <input
            id="password"
            name="password"
            type="text"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Set a password"
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => setPassword(generatePassword())}
            className="h-11 md:h-10 shrink-0 rounded-xl border border-sand-200 px-4 text-sm font-medium text-warm-700 transition hover:bg-sand-50"
          >
            Generate
          </button>
        </div>
      </Field>

      <Field label="Phone number" htmlFor="phone">
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+961 70 123 456"
          className={inputCls}
        />
      </Field>

      <Field
        label="WhatsApp number"
        htmlFor="whatsapp"
        hint="Optional — defaults to the phone number if left empty"
      >
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          placeholder="+961 70 123 456"
          className={inputCls}
        />
      </Field>

      <div className="flex gap-3 border-t border-sand-200 pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="h-11 md:h-10 rounded-lg bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? "Creating…" : "Create host"}
        </button>
        <Link
          href="/admin/hosts"
          className="inline-flex h-11 md:h-10 items-center rounded-lg border border-sand-200 px-6 text-sm font-medium text-warm-700 transition hover:bg-sand-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

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
