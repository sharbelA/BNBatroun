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
import {
  upsertAvailabilityAction,
  clearAvailabilityAction,
} from "@/app/_actions/availability";
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

// Internal status: 'blocked' | 'booked' (we never store 'available' anymore)
type InternalStatus = "blocked" | "booked";

type StatusMap = Record<string, { status: InternalStatus; note: string | null }>;

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

  // Build status map. We treat any legacy "available" rows as if they don't exist.
  const [statusMap, setStatusMap] = useState<StatusMap>(() => {
    const map: StatusMap = {};
    for (const entry of initialAvailability) {
      if (entry.status === "booked" || entry.status === "blocked") {
        map[entry.date] = {
          status: entry.status as InternalStatus,
          note: entry.note ?? null,
        };
      }
    }
    return map;
  });

  const [isPending, startTransition] = useTransition();
  const [selection, setSelection] = useState<string[] | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const dragRef = useRef<{ start: string; dragging: boolean } | null>(null);

  /* ─── Compute date arrays for modifiers ─── */
  const { bookedDates, blockedDates, selectedDates, unavailableDates } = useMemo(() => {
    const booked: Date[] = [];
    const blocked: Date[] = [];
    for (const [dateStr, entry] of Object.entries(statusMap)) {
      const d = parseISO(dateStr);
      if (entry.status === "booked") booked.push(d);
      else blocked.push(d);
    }
    const selected = (selection ?? []).map((s) => parseISO(s));
    return {
      bookedDates: booked,
      blockedDates: blocked,
      selectedDates: selected,
      unavailableDates: [...booked, ...blocked],
    };
  }, [statusMap, selection]);

  /* ─── Counts ─── */
  const counts = useMemo(
    () => ({
      booked: bookedDates.length,
      blocked: blockedDates.length,
    }),
    [bookedDates, blockedDates]
  );

  /* ─── Server sync: set status ─── */
  function applyChange(
    dates: string[],
    status: InternalStatus,
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
        status as AvailabilityStatus,
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

  /* ─── Server sync: clear (unblock) ─── */
  function applyClear(dates: string[]) {
    const previous = statusMap;
    setStatusMap((prev) => {
      const next = { ...prev };
      for (const d of dates) delete next[d];
      return next;
    });
    setSelection(null);
    setPopupOpen(false);

    startTransition(async () => {
      const result = await clearAvailabilityAction(listingId, dates);
      if (result.error) {
        setStatusMap(previous);
        toast.error(result.error);
      } else {
        toast.success(
          dates.length > 1
            ? `${dates.length} dates opened`
            : "Date opened for booking"
        );
      }
    });
  }

  /* ─── Mouse handlers ─── */
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

      // HOST single-click: toggle blocked ↔ unblocked
      if (!drag.dragging && mode === "host") {
        const current = statusMap[key]?.status;
        if (current === "booked") {
          toast.error("Booked dates can only be changed by admin");
          setSelection(null);
          return;
        }
        if (current === "blocked") {
          applyClear([key]); // unblock
        } else {
          applyChange([key], "blocked", null); // block
        }
        return;
      }

      // Host drag OR admin click/drag → open popup
      setPopupOpen(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [interactive, today, mode, statusMap]
  );

  return (
    <div>
      <CalendarStyles />

      {/* Helper text */}
      {interactive && (
        <p
          style={{
            fontSize: "13px",
            color: "var(--muted, #717171)",
            marginBottom: "16px",
            lineHeight: 1.5,
          }}
        >
          {mode === "host"
            ? "Dates are open for booking by default. Click a date to block it, click again to reopen. Drag to select a range."
            : "Dates are open for booking by default. Click or drag to block dates or mark them as booked."}
        </p>
      )}

      {/* Stat badges */}
      {interactive && (counts.blocked > 0 || counts.booked > 0) && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          {counts.booked > 0 && (
            <StatBadge
              count={counts.booked}
              label="Booked"
              color="#991b1b"
              bg="#fecaca"
            />
          )}
          <StatBadge
            count={counts.blocked}
            label="Blocked"
            color="#854d0e"
            bg="#fde68a"
          />
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
          modifiers={
            mode === "readonly"
              ? { unavailable: unavailableDates }
              : { booked: bookedDates, blocked: blockedDates, selected: selectedDates }
          }
          modifiersClassNames={
            mode === "readonly"
              ? { unavailable: "rdp-unavailable" }
              : { booked: "rdp-booked", blocked: "rdp-blocked" }
          }
          modifiersStyles={
            mode === "readonly"
              ? {
                  unavailable: {
                    backgroundColor: "#fecaca",
                    color: "#991b1b",
                    borderRadius: "10px",
                    fontWeight: 600,
                  },
                }
              : {
                  booked: {
                    backgroundColor: "#fecaca",
                    color: "#991b1b",
                    borderRadius: "10px",
                    fontWeight: 600,
                  },
                  blocked: {
                    backgroundColor: "#fde68a",
                    color: "#854d0e",
                    borderRadius: "10px",
                    fontWeight: 600,
                  },
                  selected: {
                    outline: "2.5px solid var(--accent, #c4582a)",
                    outlineOffset: "-2px",
                    borderRadius: "10px",
                    boxShadow: "0 0 0 3px var(--accent-light, #fef4f0)",
                  },
                }
          }
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
        {mode === "readonly" ? (
          <LegendDot color="#fecaca" border="#fca5a5" label="Unavailable" />
        ) : (
          <>
            <LegendDot color="#fecaca" border="#fca5a5" label="Booked" />
            <LegendDot color="#fde68a" border="#fbbf24" label="Blocked" />
          </>
        )}
      </div>

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
          statusMap={statusMap}
          onCancel={() => {
            setSelection(null);
            setPopupOpen(false);
          }}
          onSetStatus={applyChange}
          onClear={applyClear}
        />
      )}
    </div>
  );
}

/* ─── Interactive Day cell (wraps the <td>) ─────────────────── */

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
  statusMap,
  onCancel,
  onSetStatus,
  onClear,
}: {
  dates: string[];
  mode: "host" | "admin";
  statusMap: StatusMap;
  onCancel: () => void;
  onSetStatus: (
    dates: string[],
    status: InternalStatus,
    note: string | null
  ) => void;
  onClear: (dates: string[]) => void;
}) {
  const [note, setNote] = useState("");

  const sorted = [...dates].sort();
  const label =
    sorted.length === 1
      ? format(parseISO(sorted[0]), "EEEE, MMM d, yyyy")
      : `${format(parseISO(sorted[0]), "MMM d")} – ${format(
          parseISO(sorted[sorted.length - 1]),
          "MMM d, yyyy"
        )}`;

  // Check if any selected date is currently marked (so we know whether to show "Open for booking" option)
  const hasMarkedDates = dates.some((d) => statusMap[d]);

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
        <p
          style={{
            fontSize: "17px",
            fontWeight: 600,
            color: "var(--foreground, #1a1a1a)",
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>
          {sorted.length} date{sorted.length !== 1 ? "s" : ""} selected
        </p>

        <div
          style={{
            height: "1px",
            background: "var(--border-light, #ebebeb)",
            margin: "16px 0",
          }}
        />

        <label style={labelStyle}>Action</label>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Block */}
          <PopupActionButton
            label="Block these dates"
            dotColor="#d97706"
            borderColor="#fbbf24"
            bgColor="#fffbeb"
            bgHover="#fef3c7"
            textColor="#854d0e"
            onClick={() => onSetStatus(dates, "blocked", note.trim() || null)}
          />

          {/* Admin-only: Mark as booked */}
          {mode === "admin" && (
            <PopupActionButton
              label="Mark as booked"
              dotColor="#f43f5e"
              borderColor="#fca5a5"
              bgColor="#fff1f2"
              bgHover="#fecaca"
              textColor="#991b1b"
              onClick={() => onSetStatus(dates, "booked", note.trim() || null)}
            />
          )}

          {/* Open for booking — only if any selected date is currently marked */}
          {hasMarkedDates && (
            <PopupActionButton
              label="Open for booking"
              dotColor="#22c55e"
              borderColor="#86efac"
              bgColor="#f0fdf4"
              bgHover="#dcfce7"
              textColor="#166534"
              onClick={() => onClear(dates)}
            />
          )}
        </div>

        {/* Note input (only shown for block/booked, not for clear) */}
        <div style={{ marginTop: "16px" }}>
          <label style={labelStyle}>Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              mode === "admin"
                ? "e.g. Booked by Ahmad, 4 guests"
                : "e.g. Personal use"
            }
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
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--accent)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "var(--border, #ddd)")
            }
          />
        </div>

        {/* Cancel */}
        <button
          type="button"
          onClick={onCancel}
          style={{
            width: "100%",
            marginTop: "16px",
            height: "44px",
            borderRadius: "12px",
            background: "transparent",
            color: "var(--muted)",
            fontSize: "14px",
            fontWeight: 500,
            border: "1.5px solid var(--border, #ddd)",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
        >
          Cancel
        </button>
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
      .avail-card { padding: 24px; }
      @media (max-width: 640px) { .avail-card { padding: 14px; } }
      @keyframes avail-popup-in {
        from { opacity: 0; transform: translate(-50%, -48%); }
        to   { opacity: 1; transform: translate(-50%, -50%); }
      }
      @keyframes avail-spin { to { transform: rotate(360deg); } }
      .avail-spinner {
        display: inline-block; width: 14px; height: 14px;
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
      .rdp-months { gap: 32px; flex-wrap: wrap; justify-content: center; }
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
      .rdp-day { cursor: pointer; transition: transform 0.12s ease; }
      .rdp-day:hover { transform: scale(1.06); }
      .rdp-day.rdp-disabled { cursor: not-allowed; opacity: 0.4; }
      .rdp-day.rdp-disabled:hover { transform: none; }
      /* Available — all non-special, non-disabled days (targets the <td> directly) */
      .rdp-day:not(.rdp-disabled):not(.rdp-booked):not(.rdp-blocked):not(.rdp-unavailable) {
        background-color: #dcfce7; color: #166534; border-radius: 10px;
      }
      .rdp-button_previous, .rdp-button_next {
        border-radius: 10px;
        transition: background 0.15s;
      }
      .rdp-button_previous:hover, .rdp-button_next:hover {
        background: var(--surface, #f7f7f7);
      }
      @media (max-width: 768px) {
        .rdp-root { --rdp-day-height: 38px; --rdp-day-width: 38px; }
        .rdp-months { gap: 24px; }
      }
    `}</style>
  );
}
