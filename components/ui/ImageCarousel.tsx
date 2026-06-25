/**
 * ImageCarousel — Airbnb-style image slider for listing cards.
 * Shows dots, prev/next arrows on hover, and handles touch swipe.
 *
 * Usage:
 *   <ImageCarousel
 *     images={["url1", "url2"]}
 *     alt="Seafront Villa"
 *     aspectRatio="aspect-[20/19]"
 *   />
 */

"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import Icon from "./Icon";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  aspectRatio?: string;
  sizes?: string;
}

export default function ImageCarousel({
  images,
  alt,
  aspectRatio = "aspect-[20/19]",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const maxDots = 5;
  const total = images.length;

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(index, total - 1)));
    },
    [total]
  );

  const prev = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      goTo(currentIndex - 1);
    },
    [currentIndex, goTo]
  );

  const next = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      goTo(currentIndex + 1);
    },
    [currentIndex, goTo]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const threshold = 50;
    if (touchDeltaX.current > threshold) {
      goTo(currentIndex - 1);
    } else if (touchDeltaX.current < -threshold) {
      goTo(currentIndex + 1);
    }
  }, [currentIndex, goTo]);

  const handleImageError = useCallback((index: number) => {
    setFailedImages((prev) => new Set(prev).add(index));
  }, []);

  // Dot indicators — show a sliding window of maxDots
  const getDotRange = () => {
    if (total <= maxDots) return { start: 0, end: total };
    const half = Math.floor(maxDots / 2);
    let start = currentIndex - half;
    let end = currentIndex + half + 1;
    if (start < 0) {
      start = 0;
      end = maxDots;
    }
    if (end > total) {
      end = total;
      start = total - maxDots;
    }
    return { start, end };
  };

  // Single image — no carousel controls
  if (total <= 1) {
    return (
      <div
        className={`relative ${aspectRatio} overflow-hidden rounded-xl bg-[var(--surface)]`}
      >
        {images[0] && !failedImages.has(0) ? (
          <Image
            src={images[0]}
            alt={alt}
            fill
            sizes={sizes}
            className="object-cover"
            onError={() => handleImageError(0)}
          />
        ) : (
          <Placeholder />
        )}
      </div>
    );
  }

  const { start, end } = getDotRange();

  return (
    <div
      className={`group/carousel relative ${aspectRatio} overflow-hidden rounded-xl bg-[var(--surface)]`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image track */}
      <div
        className="absolute inset-0 flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={i} className="relative w-full h-full shrink-0">
            {!failedImages.has(i) ? (
              <Image
                src={src}
                alt={`${alt} — photo ${i + 1}`}
                fill
                sizes={sizes}
                className="object-cover"
                onError={() => handleImageError(i)}
                loading={i === 0 ? "eager" : "lazy"}
              />
            ) : (
              <Placeholder />
            )}
          </div>
        ))}
      </div>

      {/* Prev / Next arrows — desktop only, visible on hover */}
      {currentIndex > 0 && (
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-[var(--border-light)] flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 hover:bg-white hover:shadow-md hover:scale-105 z-10"
          aria-label="Previous image"
        >
          <Icon name="chevronLeft" size={14} strokeWidth={2.5} />
        </button>
      )}
      {currentIndex < total - 1 && (
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-[var(--border-light)] flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 hover:bg-white hover:shadow-md hover:scale-105 z-10"
          aria-label="Next image"
        >
          <Icon name="chevronRight" size={14} strokeWidth={2.5} />
        </button>
      )}

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {images.slice(start, end).map((_, i) => {
          const dotIndex = start + i;
          const isActive = dotIndex === currentIndex;
          // Shrink dots at the edges of the sliding window
          const isEdge =
            total > maxDots &&
            ((i === 0 && start > 0) || (i === end - start - 1 && end < total));

          return (
            <span
              key={dotIndex}
              className={`rounded-full transition-all duration-200 ${
                isActive
                  ? "w-[7px] h-[7px] bg-white"
                  : isEdge
                    ? "w-[5px] h-[5px] bg-white/50"
                    : "w-[6px] h-[6px] bg-white/70"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

/** Fallback when image fails to load */
function Placeholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface)]">
      <Icon
        name="home"
        size={48}
        stroke="var(--border)"
        strokeWidth={1.5}
        fill="none"
      />
    </div>
  );
}
