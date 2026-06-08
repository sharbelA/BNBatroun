"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { DayPicker } from "react-day-picker";
import type { DayButtonProps } from "react-day-picker";
import "react-day-picker/style.css";
import {
  addMonths,
  startOfMonth,
  startOfDay,
  parseISO,
  format,
  eachDayOfInterval,
  isBefore,
} from "date-fns";
import { toast } from "sonner";
import { upsertAvailabilityAction } from "@/app/_actions/availability";
import type { AvailabilityStatus } from "@/lib/supabase/types";

interface AvailabilityEntry {
  date: string;
  status: string;
  note?: string | null;
}

interface AvailabilityCalendarProps {
  listingId: string;
  initialAvailability: AvailabilityEntry[];
  mode: "readonly" | "host" | "admin";
}

type StatusMap = Record<
  string,
  { status: AvailabilityStatus; note: string | null }
>;

function dateKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function rangeBetween(a: string, b: string): string[] {
  const [start, end] =
    parseISO(a) <= parseISO(b) ? [a, b] : [b, a];
  return eachDayOfInterval({ start: parseISO(start), end: parseISO(end) }).map(
    dateKey
  );
}

export default function AvailabilityCalendar({
  listingId,
  initialAvailability,
  mode,
}: AvailabilityCalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const interactive = mode !== "readonly";

  const [statusMap, setStatusMap] = useState<StatusMap>(() => {
    const map: StatusMap = {};
    for (const entry of initialAvailability) {
      map[entry.date] = {
        status: entry.status as AvailabilityStatus,
        note: entry.note ?? null,
      };
    }
    return map;
  });

  const [, startTransition] = useTransition();
  const [selection, setSelection] = useState<string[] | null>(null);
  const dragRef = useRef<{ start: string; dragging: boolean } | null>(null);

  const { available, booked, blocked } = useMemo(() => {
    const available: Date[] = [];
    const booked: Date[] = [];
    const blocked: Date[] = [];
    for (const [dateStr, entry] of Object.entries(statusMap)) {
      const d = parseISO(dateStr);
      if (entry.status === "available") available.push(d);
      else if (entry.status === "booked") booked.push(d);
      else blocked.push(d);
    }
    return { available, booked, blocked };
  }, [statusMap]);

  const hasData = Object.keys(statusMap).length > 0;

  function applyChange(
    dates: string[],
    status: AvailabilityStatus,
    note: string | null
  ) {
    const previous = statusMap;
    setStatusMap((prev) => {
      const next = { ...prev };
      for (const d of dates) next[d] = { status, note };
      return next;
    });
    setSelection(null);

    startTransition(async () => {
      const result = await upsertAvailabilityAction(
        listingId,
        dates,
        status,
        note
      );
      if (result.error) {
        setStatusMap(previous);
        toast.error(result.error);
      } else {
        toast.success(
          dates.length > 1
            ? `${dates.length} dates updated`
            : "Date updated"
        );
      }
    });
  }

  function handleDayMouseDown(day: Date) {
    if (!interactive || isBefore(day, today)) return;
    const key = dateKey(day);
    dragRef.current = { start: key, dragging: false };
    setSelection([key]);
  }

  function handleDayMouseEnter(day: Date) {
    if (!interactive || !dragRef.current || isBefore(day, today)) return;
    dragRef.current.dragging = true;
    setSelection(rangeBetween(dragRef.current.start, dateKey(day)));
  }

  function handleDayMouseUp(day: Date) {
    if (!interactive || !dragRef.current) return;
    const drag = dragRef.current;
    dragRef.current = null;
    if (isBefore(day, today)) {
      setSelection(null);
      return;
    }

    const key = dateKey(day);

    if (!drag.dragging) {
      if (mode === "host") {
        const current = statusMap[key]?.status;
        if (current === "booked") {
          setSelection(null);
          return;
        }
        const next: AvailabilityStatus =
          current === "available" ? "blocked" : "available";
        applyChange([key], next, null);
      }
      // admin: keep popup open with the single selected date
    }
    // drag finished -> popup stays open with the range already in `selection`
  }

  return (
    <div className="availability-calendar">
      <CalendarStyles />

      <DayPicker
        numberOfMonths={3}
        startMonth={startOfMonth(today)}
        endMonth={addMonths(startOfMonth(today), 2)}
        modifiers={
          hasData ? { available, booked, blocked } : undefined
        }
        modifiersClassNames={
          hasData
            ? {
                available: "rdp-available",
                booked: "rdp-booked",
                blocked: "rdp-blocked",
              }
            : undefined
        }
        disabled={{ before: today }}
        showOutsideDays={false}
        components={
          interactive
            ? {
                DayButton: (props) => (
                  <InteractiveDayButton
                    {...props}
                    onDown={handleDayMouseDown}
                    onEnter={handleDayMouseEnter}
                    onUp={handleDayMouseUp}
                  />
                ),
              }
            : undefined
        }
      />

      {hasData && (
        <Legend showBooked={mode !== "readonly" || booked.length > 0} />
      )}

      {!hasData && mode === "readonly" && (
        <p className="text-sm text-[var(--muted)] mt-3">
          Contact us to check availability for your preferred dates.
        </p>
      )}

      {interactive && (
        <p className="text-sm text-[var(--muted)] mt-3">
          {mode === "host"
            ? "Click a date to toggle it between available and blocked, or click and drag to select a range."
            : "Click a date, or click and drag to select a range, then set its status and an optional note."}
        </p>
      )}

      {interactive && selection && selection.length > 0 && (
        <SelectionPopup
          dates={selection}
          mode={mode as "host" | "admin"}
          existingNote={statusMap[selection[0]]?.note ?? null}
          onCancel={() => setSelection(null)}
          onConfirm={applyChange}
        />
      )}
    </div>
  );
}

// ─── Interactive day button ─────────────────────────────────

function InteractiveDayButton({
  day,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- excluded from `...rest` (not a valid <button> attr)
  modifiers,
  onDown,
  onEnter,
  onUp,
  ...rest
}: DayButtonProps & {
  onDown: (d: Date) => void;
  onEnter: (d: Date) => void;
  onUp: (d: Date) => void;
}) {
  return (
    <button
      {...rest}
      onMouseDown={(e) => {
        e.preventDefault();
        onDown(day.date);
      }}
      onMouseEnter={() => onEnter(day.date)}
      onMouseUp={() => onUp(day.date)}
    />
  );
}

// ─── Selection popup ────────────────────────────────────────

function SelectionPopup({
  dates,
  mode,
  existingNote,
  onCancel,
  onConfirm,
}: {
  dates: string[];
  mode: "host" | "admin";
  existingNote: string | null;
  onCancel: () => void;
  onConfirm: (dates: string[], status: AvailabilityStatus, note: string | null) => void;
}) {
  const [status, setStatus] = useState<AvailabilityStatus>("blocked");
  const [note, setNote] = useState(existingNote ?? "");

  const sorted = [...dates].sort();
  const label =
    sorted.length === 1
      ? format(parseISO(sorted[0]), "MMM d, yyyy")
      : `${format(parseISO(sorted[0]), "MMM d")} – ${format(
          parseISO(sorted[sorted.length - 1]),
          "MMM d, yyyy"
        )}`;

  return (
    <div className="mt-4 max-w-sm rounded-xl border border-sand-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-medium text-warm-900">{label}</p>
      <p className="mb-3 text-xs text-warm-500">
        {sorted.length} date{sorted.length !== 1 ? "s" : ""} selected
      </p>

      {mode === "host" ? (
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onConfirm(dates, "blocked", note.trim() || null)}
            className="h-9 rounded-lg border border-sand-200 px-4 text-sm font-medium text-warm-700 transition hover:bg-sand-50"
          >
            Mark as Blocked
          </button>
          <button
            type="button"
            onClick={() => onConfirm(dates, "available", note.trim() || null)}
            className="h-9 rounded-lg border border-sand-200 px-4 text-sm font-medium text-warm-700 transition hover:bg-sand-50"
          >
            Mark as Available
          </button>
        </div>
      ) : (
        <div className="mb-3 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-warm-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AvailabilityStatus)}
            className="h-9 rounded-lg border border-sand-200 bg-white px-3 text-sm text-warm-900 outline-none focus:border-sea-400 focus:ring-2 focus:ring-sea-100"
          >
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-1.5">
        <label className="text-xs font-medium text-warm-700">
          Note (optional)
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Booked by Ahmad, 4 guests"
          className="h-9 rounded-lg border border-sand-200 bg-white px-3 text-sm text-warm-900 placeholder:text-warm-400 outline-none focus:border-sea-400 focus:ring-2 focus:ring-sea-100"
        />
      </div>

      <div className="flex gap-2">
        {mode === "admin" && (
          <button
            type="button"
            onClick={() => onConfirm(dates, status, note.trim() || null)}
            className="h-9 rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Confirm
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-lg border border-sand-200 px-4 text-sm font-medium text-warm-700 transition hover:bg-sand-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Legend ─────────────────────────────────────────────────

function Legend({ showBooked }: { showBooked: boolean }) {
  return (
    <div className="flex flex-wrap gap-4 mt-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded-full bg-[#dcfce7] border border-[#86efac] inline-block" />
        <span className="text-[var(--muted)]">Available</span>
      </div>
      {showBooked && (
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-[#fee2e2] border border-[#fca5a5] inline-block" />
          <span className="text-[var(--muted)]">Booked</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded-full bg-[#f3f4f6] border border-[#d1d5db] inline-block" />
        <span className="text-[var(--muted)]">Blocked</span>
      </div>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────

function CalendarStyles() {
  return (
    <style>{`
      .availability-calendar .rdp-root {
        --rdp-accent-color: var(--accent);
        --rdp-accent-background-color: var(--accent-light);
      }
      .availability-calendar .rdp-day_button {
        border-radius: 50%;
        font-size: 13px;
      }
      .availability-calendar .rdp-available .rdp-day_button {
        background-color: #dcfce7;
        color: #166534;
      }
      .availability-calendar .rdp-booked .rdp-day_button {
        background-color: #fee2e2;
        color: #991b1b;
      }
      .availability-calendar .rdp-blocked .rdp-day_button {
        background-color: #f3f4f6;
        color: #9ca3af;
      }
      .availability-calendar .rdp-months {
        gap: 1.5rem;
      }
    `}</style>
  );
}
