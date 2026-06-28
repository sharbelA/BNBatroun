"use client";

import { useMemo } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import {
  addMonths,
  startOfMonth,
  startOfDay,
  parseISO,
  format,
  isBefore,
  isAfter,
  isEqual,
  eachDayOfInterval,
} from "date-fns";
import { toast } from "sonner";
import { useBooking } from "./BookingContext";

interface AvailabilityEntry {
  date: string;
  status: string;
}

interface Props {
  availability: AvailabilityEntry[];
}

export default function GuestBookingCalendar({ availability }: Props) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const { checkIn, checkOut, setCheckIn, setCheckOut, step, setStep, reset } =
    useBooking();

  // Build unavailable set (booked + blocked)
  const { bookedDates, blockedDates, unavailableSet } = useMemo(() => {
    const booked: Date[] = [];
    const blocked: Date[] = [];
    const set = new Set<string>();
    for (const entry of availability) {
      if (entry.status === "booked" || entry.status === "blocked") {
        const d = parseISO(entry.date);
        if (entry.status === "booked") booked.push(d);
        else blocked.push(d);
        set.add(entry.date);
      }
    }
    return { bookedDates: booked, blockedDates: blocked, unavailableSet: set };
  }, [availability]);

  // Range dates between check-in and check-out
  const rangeDates = useMemo(() => {
    if (!checkIn || !checkOut) return [];
    return eachDayOfInterval({ start: checkIn, end: checkOut });
  }, [checkIn, checkOut]);

  // Check if range has conflicts
  const rangeConflict = useMemo(() => {
    if (!checkIn || !checkOut) return false;
    return rangeDates.some((d) => unavailableSet.has(format(d, "yyyy-MM-dd")));
  }, [checkIn, checkOut, rangeDates, unavailableSet]);

  function handleDayClick(day: Date) {
    if (isBefore(day, today)) return;
    const key = format(day, "yyyy-MM-dd");
    if (unavailableSet.has(key)) {
      toast.error("This date is not available");
      return;
    }

    if (step === "checkin" || step === "done") {
      // First click or restart: set check-in
      setCheckIn(day);
      setCheckOut(undefined);
      setStep("checkout");
    } else if (step === "checkout" && checkIn) {
      // Second click: set check-out
      if (isBefore(day, checkIn) || isEqual(day, checkIn)) {
        // Clicked before or same as check-in → restart
        setCheckIn(day);
        setCheckOut(undefined);
        setStep("checkout");
        return;
      }

      // Check if any unavailable date falls in the range
      const range = eachDayOfInterval({ start: checkIn, end: day });
      const conflict = range.some((d) =>
        unavailableSet.has(format(d, "yyyy-MM-dd"))
      );
      if (conflict) {
        toast.error("Your range includes unavailable dates. Please select different dates.");
        return;
      }

      setCheckOut(day);
      setStep("done");
    }
  }

  // Build modifiers
  const modifiers = useMemo(() => {
    const mods: Record<string, Date[]> = {
      booked: bookedDates,
      blocked: blockedDates,
    };
    if (checkIn) mods.rangeStart = [checkIn];
    if (checkOut) mods.rangeEnd = [checkOut];
    if (checkIn && checkOut && !rangeConflict) {
      mods.inRange = rangeDates.filter(
        (d) => isAfter(d, checkIn) && isBefore(d, checkOut)
      );
    }
    return mods;
  }, [bookedDates, blockedDates, checkIn, checkOut, rangeDates, rangeConflict]);

  return (
    <div>
      <CalendarStyles />

      {/* Instruction banner */}
      <div
        style={{
          padding: "10px 16px",
          borderRadius: "12px",
          marginBottom: "16px",
          fontSize: "13px",
          fontWeight: 500,
          lineHeight: 1.5,
          background:
            step === "checkin"
              ? "var(--accent-light, #fef4f0)"
              : step === "checkout"
              ? "#ecfdf5"
              : "#f0fdf4",
          color:
            step === "checkin"
              ? "var(--accent, #c4582a)"
              : step === "checkout"
              ? "#047857"
              : "#15803d",
          border: `1px solid ${
            step === "checkin"
              ? "var(--accent, #c4582a)"
              : step === "checkout"
              ? "#6ee7b7"
              : "#86efac"
          }20`,
        }}
      >
        {step === "checkin" && "👆 Tap a date to set your check-in"}
        {step === "checkout" && checkIn && (
          <>
            Check-in: <strong>{format(checkIn, "MMM d")}</strong>. Now tap
            your check-out date
          </>
        )}
        {step === "done" && checkIn && checkOut && (
          <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>
              ✅ {format(checkIn, "MMM d")} → {format(checkOut, "MMM d")}
            </span>
            <button
              onClick={reset}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--accent)",
                padding: "4px 8px",
              }}
            >
              Change dates
            </button>
          </span>
        )}
      </div>

      {/* Calendar */}
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid var(--border-light, #ebebeb)",
          padding: "24px",
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
          overflowX: "auto",
        }}
      >
        <DayPicker
          numberOfMonths={3}
          startMonth={startOfMonth(today)}
          endMonth={addMonths(startOfMonth(today), 2)}
          disabled={{ before: today }}
          showOutsideDays={false}
          modifiers={modifiers}
          modifiersStyles={{
            booked: {
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              fontWeight: 600,
              borderRadius: "10px",
              cursor: "not-allowed",
            },
            blocked: {
              backgroundColor: "#f3f4f6",
              color: "#6b7280",
              borderRadius: "10px",
              cursor: "not-allowed",
            },
            rangeStart: {
              backgroundColor: "var(--accent, #c4582a)",
              color: "#fff",
              fontWeight: 700,
              borderRadius: "10px 0 0 10px",
            },
            rangeEnd: {
              backgroundColor: "var(--accent, #c4582a)",
              color: "#fff",
              fontWeight: 700,
              borderRadius: "0 10px 10px 0",
            },
            inRange: {
              backgroundColor: "var(--accent-light, #fef4f0)",
              color: "var(--accent, #c4582a)",
              fontWeight: 600,
              borderRadius: "0",
            },
          }}
          onDayClick={handleDayClick}
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
        <LegendDot color="#ffffff" border="#d6d3d1" label="Available" />
        <LegendDot color="#fee2e2" border="#fca5a5" label="Booked" />
        <LegendDot color="#f3f4f6" border="#d1d5db" label="Blocked" />
        <LegendDot color="var(--accent-light, #fef4f0)" border="var(--accent, #c4582a)" label="Your selection" />
      </div>
    </div>
  );
}

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

function CalendarStyles() {
  return (
    <style>{`
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
        padding: 0 0 12px 4px; font-weight: 600;
        font-size: 15px; color: var(--foreground, #1a1a1a);
      }
      .rdp-weekday {
        font-size: 11px; font-weight: 600;
        text-transform: uppercase; letter-spacing: 0.05em;
        color: var(--muted, #717171);
      }
      .rdp-day { cursor: pointer; transition: transform 0.12s ease; border-radius: 10px; }
      .rdp-day:hover { transform: scale(1.06); }
      .rdp-day.rdp-disabled { cursor: not-allowed; opacity: 0.4; }
      .rdp-day.rdp-disabled:hover { transform: none; }
      .rdp-button_previous, .rdp-button_next {
        border-radius: 10px; transition: background 0.15s;
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
