"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui";
import type { ListingImage } from "@/lib/supabase/types";

interface PhotoGalleryProps {
  images: ListingImage[];
  title: string;
}

export default function PhotoGallery({ images, title }: PhotoGalleryProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const main = images[0];
  const side1 = images[1];
  const side2 = images[2];

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalOpen, prev, next]);

  // Lock scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  if (!main) {
    return (
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--surface)] to-[#ede4d8] h-64 md:h-96 flex flex-col items-center justify-center gap-3">
        <Icon name="home" size={48} stroke="var(--muted)" strokeWidth={1.5} fill="none" />
        <span className="text-sm text-[var(--muted)] font-medium">Photos coming soon</span>
      </div>
    );
  }

  return (
    <>
      {/* ── Grid ── */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-2 rounded-2xl overflow-hidden max-h-[520px]">
          {/* Main image */}
          <div className="relative aspect-[16/9]">
            <Image
              src={main.url}
              alt={main.alt_text ?? title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 66vw"
              priority
            />
          </div>

          {/* Side images — desktop only */}
          {(side1 || side2) && (
            <div className="hidden md:grid grid-rows-2 gap-2">
              {side1 && (
                <div className="relative">
                  <Image
                    src={side1.url}
                    alt={side1.alt_text ?? title}
                    fill
                    className="object-cover"
                    sizes="33vw"
                  />
                </div>
              )}
              {side2 && (
                <div className="relative">
                  <Image
                    src={side2.url}
                    alt={side2.alt_text ?? title}
                    fill
                    className="object-cover"
                    sizes="33vw"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Show all photos button */}
        {images.length > 1 && (
          <button
            onClick={() => { setActiveIndex(0); setModalOpen(true); }}
            className="absolute bottom-4 right-4 flex items-center gap-2 bg-white border border-[var(--border)] rounded-full px-4 py-2 text-sm font-medium shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-shadow duration-200"
          >
            <Icon name="grid" size={16} />
            Show all photos ({images.length})
          </button>
        )}
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setModalOpen(false)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 z-10 w-11 h-11 flex items-center justify-center text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors"
            onClick={() => setModalOpen(false)}
            aria-label="Close gallery"
          >
            <Icon name="x" size={24} stroke="white" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full">
            {activeIndex + 1} / {images.length}
          </div>

          {/* Prev */}
          {images.length > 1 && (
            <button
              className="absolute left-2 sm:left-4 z-10 w-11 h-11 flex items-center justify-center text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous photo"
            >
              <Icon name="chevronLeft" size={24} stroke="white" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative w-full max-w-4xl max-h-[80vh] mx-12 sm:mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[activeIndex].url}
              alt={images[activeIndex].alt_text ?? title}
              width={1200}
              height={800}
              className="object-contain w-full h-full max-h-[80vh]"
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              className="absolute right-2 sm:right-4 z-10 w-11 h-11 flex items-center justify-center text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next photo"
            >
              <Icon name="chevronRight" size={24} stroke="white" />
            </button>
          )}

          {/* Thumbnail strip */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-4">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                className={`relative w-16 h-12 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeIndex
                    ? "border-white opacity-100"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt_text ?? `Photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
