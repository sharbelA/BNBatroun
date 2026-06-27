"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { reorderListingsAction } from "@/app/_actions/reorder-listings";

interface ListingItem {
  id: string;
  title: string;
  internal_name: string | null;
  location: string;
  price: number;
  is_active: boolean;
  cover_image: string | null;
}

export default function ReorderGrid({
  listings: initial,
}: {
  listings: ListingItem[];
}) {
  const [listings, setListings] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<{ currentIndex: number } | null>(null);

  /* ─── Desktop drag ─── */
  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setListings((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(index, 0, moved);
      return updated;
    });
    setDragIndex(index);
  }

  function handleDragEnd() {
    setDragIndex(null);
    save();
  }

  /* ─── Touch drag ─── */
  function handleTouchStart(index: number) {
    touchRef.current = { currentIndex: index };
    setDragIndex(index);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!touchRef.current || !gridRef.current) return;
    const touch = e.touches[0];
    const elements = gridRef.current.children;
    for (let i = 0; i < elements.length; i++) {
      const rect = elements[i].getBoundingClientRect();
      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom &&
        i !== touchRef.current.currentIndex
      ) {
        const fromIndex = touchRef.current.currentIndex;
        setListings((prev) => {
          const updated = [...prev];
          const [moved] = updated.splice(fromIndex, 1);
          updated.splice(i, 0, moved);
          return updated;
        });
        touchRef.current.currentIndex = i;
        setDragIndex(i);
        break;
      }
    }
  }

  function handleTouchEnd() {
    touchRef.current = null;
    setDragIndex(null);
    save();
  }

  /* ─── Move buttons ─── */
  function move(from: number, to: number) {
    if (to < 0 || to >= listings.length) return;
    setListings((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
    save();
  }

  /* ─── Save ─── */
  function save() {
    startTransition(async () => {
      const result = await reorderListingsAction(
        listings.map((l) => l.id)
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Order saved");
      }
    });
  }

  return (
    <div>
      {isPending && (
        <div className="mb-4 text-sm text-warm-500 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-warm-300 border-t-[var(--accent)] rounded-full animate-spin" />
          Saving...
        </div>
      )}

      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-3"
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {listings.map((listing, index) => (
          <div
            key={listing.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onTouchStart={() => handleTouchStart(index)}
            className={`flex items-center gap-4 rounded-xl border bg-white px-4 py-3 cursor-grab active:cursor-grabbing transition-all ${
              dragIndex === index
                ? "opacity-50 border-[var(--accent)] ring-2 ring-[var(--accent)]/20"
                : "border-sand-200 hover:border-warm-300"
            }`}
          >
            {/* Order number */}
            <span className="text-lg font-bold text-warm-300 w-8 text-center shrink-0">
              {index + 1}
            </span>

            {/* Drag handle */}
            <div className="text-warm-400 shrink-0 cursor-grab">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="5" cy="3" r="1.5" />
                <circle cx="11" cy="3" r="1.5" />
                <circle cx="5" cy="8" r="1.5" />
                <circle cx="11" cy="8" r="1.5" />
                <circle cx="5" cy="13" r="1.5" />
                <circle cx="11" cy="13" r="1.5" />
              </svg>
            </div>

            {/* Thumbnail */}
            <div className="w-16 h-12 rounded-lg overflow-hidden bg-sand-100 shrink-0 relative">
              {listing.cover_image ? (
                <Image
                  src={listing.cover_image}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-warm-300 text-xs">
                  📷
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-warm-900 truncate">
                {listing.title}
              </p>
              {listing.internal_name && (
                <p className="text-xs text-warm-400 truncate">
                  🔒 {listing.internal_name}
                </p>
              )}
              <p className="text-xs text-warm-500">
                {listing.location} · ${listing.price}/night
              </p>
            </div>

            {/* Status */}
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                listing.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-warm-100 text-warm-500"
              }`}
            >
              {listing.is_active ? "Active" : "Inactive"}
            </span>

            {/* Arrow buttons */}
            <div className="flex flex-col gap-1 shrink-0">
              <button
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
                className="w-6 h-6 rounded bg-sand-100 text-warm-500 text-xs flex items-center justify-center hover:bg-sand-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                ↑
              </button>
              <button
                onClick={() => move(index, index + 1)}
                disabled={index === listings.length - 1}
                className="w-6 h-6 rounded bg-sand-100 text-warm-500 text-xs flex items-center justify-center hover:bg-sand-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
