"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import BookingCard from "./BookingCard";

interface MobileBookingBarProps {
  price: number;
  maxGuests: number;
  title: string;
  slug: string;
  availability?: { date: string; status: string }[];
}

export default function MobileBookingBar({
  price,
  maxGuests,
  title,
  slug,
  availability,
}: MobileBookingBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      {/* Fixed bottom bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[var(--border-light)] px-4 py-3 flex items-center justify-between gap-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div>
          <span className="text-lg font-bold">${price.toLocaleString()}</span>
          <span className="text-[var(--muted)] text-sm ml-1">/ night</span>
        </div>
        <button
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
        >
          <Icon name="calendar" size={16} stroke="white" />
          Reserve
        </button>
      </div>

      {/* Bottom sheet */}
      {sheetOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end"
          onClick={() => setSheetOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-white rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base">Book this chalet</h3>
              <button
                onClick={() => setSheetOpen(false)}
                className="p-1 hover:bg-[var(--surface)] rounded-full"
                aria-label="Close"
              >
                <Icon name="x" size={20} />
              </button>
            </div>
            <BookingCard
              price={price}
              maxGuests={maxGuests}
              title={title}
              slug={slug}
              availability={availability}
            />
          </div>
        </div>
      )}
    </>
  );
}
