"use client";

import { useMemo, useRef, useState, useTransition, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import type { DayProps } from "react-day-picker";
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

/* ─── Types ─────────────────────────────────────────────────── */

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

/* ─── Helpers ───────────────────────────────────────────────── */

function dateKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function rangeBetween(a: string, b: string): string[] {
  const [start, end] = parseISO(a) <= parseISO(b) ? [a, b] : [b, a];
  return eachDayOfInterval({
    start: parseISO(start),
    end: parseISO(end),
  }).map(dateKey);
}

/* ─── Main component ───────────────────────────────────────── */

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

  const [isPending, startTransition] = useTransition();
  const [selection, setSelection] = useState<string[] | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const dragRef = useRef<{ start: string; dragging: boolean } | null>(null);

  const hasData = Object.keys(statusMap).length > 0;

  /* ─── Compute date arrays for modifiers ─── */
  const { availableDates, bookedDates, blockedDates, selectedDates } =
    useMemo(() => {
      const available: Date[] = [];
      const booked: Date[] = [];
      const blocked: Date[] = [];
      for (const [dateStr, entry] of Object.entries(statusMap)) {
        const d = parseISO(dateStr);
        if (entry.status === "available") available.push(d);
        else if (entry.status === "booked") booked.push(d);
        else blocked.push(d);
      }
      const selected = (selection ?? []).map((s) => parseISO(s));
      return {
        availableDates: available,
        bookedDates: booked,
        blockedDates: blocked,
        selectedDates: selected,
      };
    }, [statusMap, selection]);

  /* ─── Counts ─── */
  const counts = useMemo(() => {
    return {
      available: availableDates.length,
      booked: bookedDates.length,
      blocked: blockedDates.length,
    };
  }, [availableDates, bookedDates, blockedDates]);

  /* ─── Server sync ─── */
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
    setPopupOpen(false);

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
          dates.length > 1 ? `${dates.length} dates updated` : "Date updated"
        );
      }
    });
  }

  /* ─── Mouse handlers (called from custom Day component) ─── */
  const handleDown = useCallback(
    (day: Date) => {
      if (!interactive || isBefore(day, today)) return;
      const key = dateKey(day);
      dragRef.current = { start: key, dragging: false };
      setSelection([key]);
      setPopupOpen(false);
    },
    [interactive, today]
  );

  const handleEnter = useCallback(
    (day: Date) => {
      if (!interactive || !dragRef.current || isBefore(day, today)) return;
      dragRef.current.dragging = true;
      setSelection(rangeBetween(dragRef.current.start, dateKey(day)));
    },
    [interactive, today]
  );

  const handleUp = useCallback(
    (day: Date) => {
      if (!interactive || !dragRef.current) return;
      const drag = dragRef.current;
      dragRef.current = null;
      if (isBefore(day, today)) {
        setSelection(null);
        return;
      }

      const key = dateKey(day);
      if (!drag.dragging && mode === "host") {
        const current = statusMap[key]?.status;
        if (current === "booked") {
          toast.error("Booked dates can only be changed by admin");
          setSelection(null);
          return;
        }
        const next: AvailabilityStatus =
          current === "available" ? "blocked" : "available";
        applyChange([key], next, null);
      } else {
        // Admin mode (any click), or host drag → open popup now
        setPopupOpen(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [interactive, today, mode, statusMap]
  );

  return (
    <div>
      <CalendarStyles />

      {/* Stat badges */}
      {interactive && hasData && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <StatBadge count={counts.available} label="Available" color="#16a34a" bg="#dcfce7" />
          {(mode === "admin" || counts.booked > 0) && (
            <StatBadge count={counts.booked} label="Booked" color="#dc2626" bg="#fee2e2" />
          )}
          <StatBadge count={counts.blocked} label="Blocked" color="#6b7280" bg="#f3f4f6" />
        </div>
      )}

      {/* Calendar */}
      <div
        className="avail-card"
        style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid var(--border-light, #ebebeb)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
          overflowX: "auto",
        }}
      >
        <DayPicker
          numberOfMonths={3}
          startMonth={startOfMonth(today)}
          endMonth={addMonths(startOfMonth(today), 2)}
          disabled={{ before: today }}
          showOutsideDays={false}
          modifiers={{
            available: availableDates,
            booked: bookedDates,
            blocked: blockedDates,
            selected: selectedDates,
          }}
          modifiersStyles={{
            available: {
              backgroundColor: "#dcfce7",
              color: "#15803d",
              fontWeight: 600,
              borderRadius: "10px",
            },
            booked: {
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              fontWeight: 600,
              borderRadius: "10px",
            },
            blocked: {
              backgroundColor: "#f3f4f6",
              color: "#6b7280",
              borderRadius: "10px",
            },
            selected: {
              outline: "2.5px solid var(--accent, #c4582a)",
              outlineOffset: "-2px",
              borderRadius: "10px",
              boxShadow: "0 0 0 3px var(--accent-light, #fef4f0)",
            },
          }}
          components={
            interactive
              ? {
                  Day: (props) => (
                    <InteractiveDay
                      {...props}
                      onDown={handleDown}
                      onEnter={handleEnter}
                      onUp={handleUp}
                    />
                  ),
                }
              : undefined
          }
        />
      </div>

      {/* Legend */}
      {(hasData || mode !== "readonly") && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            marginTop: "20px",
            padding: "12px 16px",
            background: "var(--surface, #f7f7f7)",
            borderRadius: "12px",
          }}
        >
          <LegendDot color="#dcfce7" border="#86efac" label="Available" />
          {(mode !== "readonly" || bookedDates.length > 0) && (
            <LegendDot color="#fee2e2" border="#fca5a5" label="Booked" />
          )}
          <LegendDot color="#f3f4f6" border="#d1d5db" label="Blocked" />
        </div>
      )}

      {/* Hint */}
      {!hasData && mode === "readonly" && (
        <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "16px" }}>
          Contact us to check availability for your preferred dates.
        </p>
      )}

      {interactive && (
        <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "16px", lineHeight: 1.5 }}>
          {mode === "host"
            ? "Click a date to toggle available ↔ blocked, or drag to select a range. Booked dates (set by admin) cannot be changed."
            : "Click a date or drag to select a range, then choose a status and optional note."}
        </p>
      )}

      {/* Saving spinner */}
      {isPending && (
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            color: "var(--muted)",
          }}
        >
          <span className="avail-spinner" />
          Saving…
        </div>
      )}

      {/* Selection popup */}
      {interactive && popupOpen && selection && selection.length > 0 && (
        <SelectionPopup
          dates={selection}
          mode={mode as "host" | "admin"}
          existingNote={statusMap[selection[0]]?.note ?? null}
          onCancel={() => {
            setSelection(null);
            setPopupOpen(false);
          }}
          onConfirm={applyChange}
        />
      )}
    </div>
  );
}

/* ─── Interactive Day cell (wraps the whole <td>) ──────────── */

function InteractiveDay({
  day,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  modifiers,
  onDown,
  onEnter,
  onUp,
  ...rest
}: DayProps & {
  onDown: (d: Date) => void;
  onEnter: (d: Date) => void;
  onUp: (d: Date) => void;
}) {
  return (
    <td
      {...rest}
      onMouseDown={(e) => {
        e.preventDefault();
        onDown(day.date);
      }}
      onMouseEnter={() => onEnter(day.date)}
      onMouseUp={() => onUp(day.date)}
      onTouchStart={(e) => {
        e.preventDefault();
        onDown(day.date);
      }}
      onTouchEnd={() => onUp(day.date)}
    />
  );
}

/* ─── Stat badge ────────────────────────────────────────────── */

function StatBadge({
  count,
  label,
  color,
  bg,
}: {
  count: number;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 16px",
        background: bg,
        borderRadius: "12px",
        minWidth: "100px",
      }}
    >
      <span
        style={{
          fontSize: "22px",
          fontWeight: 700,
          color,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {count}
      </span>
      <span style={{ fontSize: "13px", color, fontWeight: 500 }}>{label}</span>
    </div>
  );
}

/* ─── Legend dot ─────────────────────────────────────────────── */

function LegendDot({
  color,
  border,
  label,
}: {
  color: string;
  border: string;
  label: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span
        style={{
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          background: color,
          border: `1.5px solid ${border}`,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: "13px", color: "var(--muted)" }}>{label}</span>
    </div>
  );
}

/* ─── Selection popup ───────────────────────────────────────── */

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
  onConfirm: (
    dates: string[],
    status: AvailabilityStatus,
    note: string | null
  ) => void;
}) {
  const [status, setStatus] = useState<AvailabilityStatus>("blocked");
  const [note, setNote] = useState(existingNote ?? "");

  const sorted = [...dates].sort();
  const label =
    sorted.length === 1
      ? format(parseISO(sorted[0]), "EEEE, MMM d, yyyy")
      : `${format(parseISO(sorted[0]), "MMM d")} – ${format(
          parseISO(sorted[sorted.length - 1]),
          "MMM d, yyyy"
        )}`;

  return (
    <>
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.15)",
          zIndex: 40,
          backdropFilter: "blur(2px)",
        }}
      />

      <div
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 50,
          width: "calc(100% - 32px)",
          maxWidth: "400px",
          background: "#fff",
          borderRadius: "20px",
          padding: "28px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
          animation: "avail-popup-in 0.2s ease-out",
        }}
      >
        <p style={{ fontSize: "17px", fontWeight: 600, color: "var(--foreground, #1a1a1a)" }}>
          {label}
        </p>
        <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>
          {sorted.length} date{sorted.length !== 1 ? "s" : ""} selected
        </p>

        <div style={{ height: "1px", background: "var(--border-light, #ebebeb)", margin: "16px 0" }} />

        {mode === "host" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <PopupActionButton
              label="Mark as Available"
              dotColor="#22c55e"
              borderColor="#86efac"
              bgColor="#f0fdf4"
              bgHover="#dcfce7"
              textColor="#166534"
              onClick={() => onConfirm(dates, "available", note.trim() || null)}
            />
            <PopupActionButton
              label="Mark as Blocked"
              dotColor="#9ca3af"
              borderColor="#d1d5db"
              bgColor="#f9fafb"
              bgHover="#f3f4f6"
              textColor="#374151"
              onClick={() => onConfirm(dates, "blocked", note.trim() || null)}
            />
          </div>
        ) : (
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Status</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {([
                { value: "available" as const, label: "Available", color: "#16a34a", bg: "#f0fdf4", border: "#86efac" },
                { value: "booked" as const, label: "Booked", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
                { value: "blocked" as const, label: "Blocked", color: "#6b7280", bg: "#f9fafb", border: "#d1d5db" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  style={{
                    flex: 1,
                    padding: "10px 8px",
                    borderRadius: "12px",
                    border: `2px solid ${status === opt.value ? opt.color : opt.border}`,
                    background: status === opt.value ? opt.bg : "transparent",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: status === opt.value ? 700 : 500,
                    color: opt.color,
                    transition: "all 0.15s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: mode === "host" ? "16px" : "0" }}>
          <label style={labelStyle}>Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Booked by Ahmad, 4 guests"
            style={{
              width: "100%",
              height: "44px",
              borderRadius: "12px",
              border: "1.5px solid var(--border, #ddd)",
              background: "#fff",
              padding: "0 14px",
              fontSize: "14px",
              color: "var(--foreground)",
              outline: "none",
              transition: "border-color 0.15s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border, #ddd)")}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          {mode === "admin" && (
            <button
              type="button"
              onClick={() => onConfirm(dates, status, note.trim() || null)}
              style={{
                flex: 1,
                height: "44px",
                borderRadius: "12px",
                background: "var(--accent)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "opacity 0.15s",
              }}
            >
              Confirm
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: mode === "admin" ? "none" : 1,
              height: "44px",
              borderRadius: "12px",
              background: "transparent",
              color: "var(--muted)",
              fontSize: "14px",
              fontWeight: 500,
              border: "1.5px solid var(--border, #ddd)",
              cursor: "pointer",
              padding: "0 20px",
              transition: "background 0.15s",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

function PopupActionButton({
  label,
  dotColor,
  borderColor,
  bgColor,
  bgHover,
  textColor,
  onClick,
}: {
  label: string;
  dotColor: string;
  borderColor: string;
  bgColor: string;
  bgHover: string;
  textColor: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "14px 16px",
        borderRadius: "14px",
        border: `1.5px solid ${borderColor}`,
        background: bgColor,
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: 600,
        color: textColor,
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = bgHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = bgColor;
      }}
    >
      <span
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: dotColor,
          flexShrink: 0,
        }}
      />
      {label}
    </button>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "var(--muted)",
  marginBottom: "8px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

/* ─── Styles ────────────────────────────────────────────────── */

function CalendarStyles() {
  return (
    <style>{`
      .avail-card {
        padding: 24px;
      }
      @media (max-width: 640px) {
        .avail-card {
          padding: 14px;
        }
      }
      @keyframes avail-popup-in {
        from { opacity: 0; transform: translate(-50%, -48%); }
        to   { opacity: 1; transform: translate(-50%, -50%); }
      }
      @keyframes avail-spin {
        to { transform: rotate(360deg); }
      }
      .avail-spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid var(--border-light, #ebebeb);
        border-top-color: var(--accent);
        border-radius: 50%;
        animation: avail-spin 0.6s linear infinite;
      }
      .rdp-root {
        --rdp-accent-color: var(--accent);
        --rdp-accent-background-color: var(--accent-light);
        --rdp-day-height: 42px;
        --rdp-day-width: 42px;
        font-family: inherit;
        max-width: 100%;
      }
      .rdp-months {
        gap: 32px;
        flex-wrap: wrap;
        justify-content: center;
      }
      .rdp-month_caption {
        padding: 0 0 12px 4px;
        font-weight: 600;
        font-size: 15px;
        color: var(--foreground, #1a1a1a);
      }
      .rdp-weekday {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--muted, #717171);
      }
      .rdp-day {
        cursor: pointer;
        transition: transform 0.12s ease;
      }
      .rdp-day:hover {
        transform: scale(1.06);
      }
      .rdp-day.rdp-disabled {
        cursor: not-allowed;
        opacity: 0.4;
      }
      .rdp-day.rdp-disabled:hover {
        transform: none;
      }
      .rdp-button_previous,
      .rdp-button_next {
        border-radius: 10px;
        transition: background 0.15s;
      }
      .rdp-button_previous:hover,
      .rdp-button_next:hover {
        background: var(--surface, #f7f7f7);
      }
      @media (max-width: 768px) {
        .rdp-root {
          --rdp-day-height: 38px;
          --rdp-day-width: 38px;
        }
        .rdp-months {
          gap: 24px;
        }
      }
    `}</style>
  );
}
