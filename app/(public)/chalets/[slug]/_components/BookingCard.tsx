"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import {
  differenceInDays,
  format,
  addDays,
  isBefore,
  isEqual,
  startOfDay,
  parseISO,
  eachDayOfInterval,
} from "date-fns";
import { Icon } from "@/components/ui";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://manzeli.com";
const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

type PickerField = "checkin" | "checkout" | null;

interface AvailabilityEntry {
  date: string;
  status: string;
}

interface BookingCardProps {
  price: number;
  maxGuests: number;
  title: string;
  slug: string;
  availability?: AvailabilityEntry[];
}

export default function BookingCard({
  price,
  maxGuests,
  title,
  slug,
  availability = [],
}: BookingCardProps) {
  const today = useMemo(() => startOfDay(new Date()), []);

  // Compute unavailable dates (booked or blocked)
  const { unavailableDates, bookedDates, blockedDates } = useMemo(() => {
    const unavailable: Date[] = [];
    const booked: Date[] = [];
    const blocked: Date[] = [];
    for (const entry of availability) {
      if (entry.status === "booked" || entry.status === "blocked") {
        const d = parseISO(entry.date);
        unavailable.push(d);
        if (entry.status === "booked") booked.push(d);
        else blocked.push(d);
      }
    }
    return { unavailableDates: unavailable, bookedDates: booked, blockedDates: blocked };
  }, [availability]);

  // Set of unavailable date strings for fast range checking
  const unavailableSet = useMemo(() => {
    const set = new Set<string>();
    for (const entry of availability) {
      if (entry.status === "booked" || entry.status === "blocked") {
        set.add(entry.date);
      }
    }
    return set;
  }, [availability]);

  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState(Math.min(2, maxGuests));
  const [openField, setOpenField] = useState<PickerField>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Close calendar on outside click
  useEffect(() => {
    if (!openField) return;
    const handler = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setOpenField(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openField]);

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      if (openField === "checkin") {
        setCheckIn(date);
        if (
          checkOut &&
          date &&
          (isBefore(checkOut, date) || isEqual(checkOut, date))
        ) {
          setCheckOut(undefined);
        }
        if (date) setOpenField("checkout");
      } else {
        setCheckOut(date);
        if (date) setOpenField(null);
      }
    },
    [openField, checkOut]
  );

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(0, differenceInDays(checkOut, checkIn));
  }, [checkIn, checkOut]);

  const total = nights * price;

  // Check if any unavailable date falls within the selected range
  const rangeConflict = useMemo(() => {
    if (!checkIn || !checkOut || nights === 0) return false;
    const days = eachDayOfInterval({ start: checkIn, end: addDays(checkOut, -1) });
    return days.some((d) => unavailableSet.has(format(d, "yyyy-MM-dd")));
  }, [checkIn, checkOut, nights, unavailableSet]);

  const whatsappUrl = useMemo(() => {
    if (!checkIn || !checkOut || nights === 0 || rangeConflict) return null;
    const message = encodeURIComponent(
      `Hi! I'm interested in booking *${title}*\n\n` +
        `📅 Check-in: ${format(checkIn, "MMM d, yyyy")}\n` +
        `📅 Check-out: ${format(checkOut, "MMM d, yyyy")}\n` +
        `🌙 Nights: ${nights}\n` +
        `👥 Guests: ${guests}\n` +
        `💰 Total: $${total.toLocaleString()}\n\n` +
        `Listing: ${SITE_URL}/chalets/${slug}`
    );
    return `https://wa.me/${WA_NUMBER}?text=${message}`;
  }, [checkIn, checkOut, guests, nights, total, title, slug, rangeConflict]);

  // Range modifiers for DayPicker
  const modifiers = useMemo(
    () => ({
      ...(checkIn ? { range_start: [checkIn] } : {}),
      ...(checkOut ? { range_end: [checkOut] } : {}),
      ...(checkIn && checkOut
        ? { range_middle: { after: checkIn, before: checkOut } }
        : {}),
      ...(bookedDates.length ? { booked: bookedDates } : {}),
      ...(blockedDates.length ? { blocked: blockedDates } : {}),
    }),
    [checkIn, checkOut, bookedDates, blockedDates]
  );

  const disabled = useMemo(
    () => [
      ...(openField === "checkout" && checkIn
        ? [{ before: addDays(checkIn, 1) }]
        : [{ before: today }]),
      ...unavailableDates,
    ],
    [openField, checkIn, today, unavailableDates]
  );

  const pickerSelected = openField === "checkin" ? checkIn : checkOut;
  const pickerDefaultMonth =
    openField === "checkout" && checkIn ? checkIn : today;

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-2xl border border-[var(--border)] shadow-[0_4px_24px_rgba(0,0,0,0.10)] p-6"
    >
      <style>{CALENDAR_CSS}</style>

      {/* ── Price ── */}
      <div className="pb-4 mb-4 border-b border-[var(--border-light)]">
        <span className="text-2xl font-bold">${price.toLocaleString()}</span>
        <span className="text-[var(--muted)] text-sm ml-1">/ night</span>
      </div>

      {/* ── Date triggers ── */}
      <div
        className={`grid grid-cols-2 rounded-xl border mb-3 overflow-hidden transition-colors ${
          openField ? "border-[var(--accent)]" : "border-[var(--border)]"
        }`}
      >
        <button
          type="button"
          onClick={() =>
            setOpenField((f) => (f === "checkin" ? null : "checkin"))
          }
          className={`p-3 text-left border-r transition-colors ${
            openField === "checkin"
              ? "bg-[var(--accent-light)] border-[var(--accent)]"
              : "border-[var(--border)] hover:bg-[var(--surface)]"
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
            Check-in
          </p>
          <p
            className={`text-sm font-semibold mt-0.5 ${
              checkIn ? "" : "text-[var(--muted)]"
            }`}
          >
            {checkIn ? format(checkIn, "MMM d, yyyy") : "Add date"}
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!checkIn) return;
            setOpenField((f) => (f === "checkout" ? null : "checkout"));
          }}
          className={`p-3 text-left transition-colors ${
            !checkIn
              ? "opacity-50 cursor-not-allowed"
              : openField === "checkout"
              ? "bg-[var(--accent-light)]"
              : "hover:bg-[var(--surface)]"
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
            Check-out
          </p>
          <p
            className={`text-sm font-semibold mt-0.5 ${
              checkOut ? "" : "text-[var(--muted)]"
            }`}
          >
            {checkOut ? format(checkOut, "MMM d, yyyy") : "Add date"}
          </p>
        </button>
      </div>

      {/* ── Inline calendar ── */}
      {openField && (
        <div className="booking-cal mb-3 border border-[var(--border-light)] rounded-2xl bg-[var(--surface)] p-3 animate-fade-in-up">
          <div className="flex items-center justify-between mb-1 px-1">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
              {openField === "checkin"
                ? "Select check-in date"
                : "Select check-out date"}
            </p>
            <button
              type="button"
              onClick={() => setOpenField(null)}
              className="p-1 rounded-full hover:bg-[var(--border-light)] transition-colors"
              aria-label="Close calendar"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
          <DayPicker
            mode="single"
            selected={pickerSelected}
            onSelect={handleSelect}
            disabled={disabled}
            defaultMonth={pickerDefaultMonth}
            modifiers={modifiers}
            modifiersClassNames={{
              range_start: "bk-range-start",
              range_end: "bk-range-end",
              range_middle: "bk-range-middle",
            }}
            modifiersStyles={{
              booked: {
                backgroundColor: "#fee2e2",
                color: "#b91c1c",
                borderRadius: "50%",
                opacity: 0.6,
              },
              blocked: {
                backgroundColor: "#f3f4f6",
                color: "#9ca3af",
                borderRadius: "50%",
                opacity: 0.6,
              },
            }}
            showOutsideDays={false}
          />
        </div>
      )}

      {/* ── Guests ── */}
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
          Guests
        </label>
        <div className="flex items-center border border-[var(--border)] rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            className="px-4 py-2.5 text-xl font-light hover:bg-[var(--surface)] transition-colors select-none"
            aria-label="Remove guest"
          >
            −
          </button>
          <span className="flex-1 text-center text-sm font-semibold">
            {guests} guest{guests !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
            className="px-4 py-2.5 text-xl font-light hover:bg-[var(--surface)] transition-colors select-none"
            aria-label="Add guest"
          >
            +
          </button>
        </div>
        <p className="text-xs text-[var(--muted)]">Max {maxGuests} guests</p>
      </div>

      {/* ── Price breakdown ── */}
      {nights > 0 && (
        <div className="border-t border-[var(--border-light)] pt-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between text-[var(--muted)]">
            <span>
              ${price.toLocaleString()} × {nights} night{nights !== 1 ? "s" : ""}
            </span>
            <span className="text-[var(--foreground)] font-medium">
              ${total.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between font-bold text-base pt-3 border-t border-[var(--border-light)]">
            <span>Total</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* ── Range conflict warning ── */}
      {rangeConflict && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "12px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            marginBottom: "12px",
            fontSize: "13px",
            color: "#b91c1c",
            lineHeight: 1.5,
          }}
        >
          Some dates in your range are unavailable. Please adjust your dates.
        </div>
      )}

      {/* ── CTAs ── */}
      <div className="space-y-2">
        <a
          href={whatsappUrl ?? "#"}
          target={whatsappUrl ? "_blank" : undefined}
          rel="noopener noreferrer"
          onClick={(e) => {
            if (!whatsappUrl) e.preventDefault();
          }}
          className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
            whatsappUrl
              ? "bg-[#25D366] hover:bg-[#1db954] text-white shadow-sm hover:shadow-md"
              : "bg-[var(--surface)] text-[var(--muted)] cursor-not-allowed"
          }`}
        >
          <Icon
            name="whatsapp"
            size={18}
            fill={whatsappUrl ? "white" : "currentColor"}
            stroke="none"
          />
          {whatsappUrl ? "Reserve on WhatsApp" : "Select dates to reserve"}
        </a>

        {WA_NUMBER && (
          <a
            href={`tel:${WA_NUMBER}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold border border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
          >
            <Icon name="phone" size={15} />
            Call us
          </a>
        )}
      </div>

      {/* ── Note ── */}
      <p className="text-xs text-center text-[var(--muted)] mt-4 leading-relaxed">
        Pay via{" "}
        <span className="font-semibold text-[var(--foreground)]">
          Whish Money
        </span>{" "}
        after confirmation. No upfront charges.
      </p>
    </div>
  );
}

// ─── Calendar styles ─────────────────────────────────────────

const CALENDAR_CSS = `
  /* Override DayPicker CSS variables to match Manzeli design */
  .booking-cal .rdp-root {
    --rdp-accent-color: var(--accent);
    --rdp-accent-background-color: var(--accent-light);
    --rdp-today-color: var(--accent);
    --rdp-day-height: 36px;
    --rdp-day-width: 36px;
    --rdp-day_button-height: 34px;
    --rdp-day_button-width: 34px;
    --rdp-day_button-border-radius: 50%;
    --rdp-selected-border: 2px solid var(--accent);
    font-size: 13px;
  }
  .booking-cal .rdp-month_caption {
    font-size: 14px;
    font-weight: 600;
  }
  .booking-cal .rdp-weekday {
    font-size: 11px;
    font-weight: 600;
    color: var(--muted);
  }
  /* Range start — right half filled */
  .booking-cal .bk-range-start {
    background: linear-gradient(to right, transparent 50%, var(--accent-light) 50%);
  }
  .booking-cal .bk-range-start .rdp-day_button {
    background-color: var(--accent) !important;
    color: white !important;
    border-color: transparent !important;
    border-radius: 50% !important;
  }
  /* Range end — left half filled */
  .booking-cal .bk-range-end {
    background: linear-gradient(to left, transparent 50%, var(--accent-light) 50%);
  }
  .booking-cal .bk-range-end .rdp-day_button {
    background-color: var(--accent) !important;
    color: white !important;
    border-color: transparent !important;
    border-radius: 50% !important;
  }
  /* Range middle — solid fill, no circle */
  .booking-cal .bk-range-middle {
    background-color: var(--accent-light);
  }
  .booking-cal .bk-range-middle .rdp-day_button {
    --rdp-day_button-border-radius: 0 !important;
    color: var(--foreground) !important;
    border-color: transparent !important;
  }
`;
