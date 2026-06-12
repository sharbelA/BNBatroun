"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import {
  addPhotoAction,
  deletePhotoAction,
  reorderPhotosAction,
} from "@/app/_actions/photos";
import type { ListingImage } from "@/lib/supabase/types";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

interface Props {
  listingId: string;
  initialImages: ListingImage[];
  supabaseUrl: string;
}

export default function PhotoManager({ listingId, initialImages, supabaseUrl }: Props) {
  const [images, setImages] = useState<ListingImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (!ALLOWED.includes(file.type)) {
        setError(`${file.name}: only JPG, PNG, WebP allowed`);
        return;
      }
      if (file.size > MAX_SIZE) {
        setError(`${file.name}: max 5MB per image`);
        return;
      }
    }

    setUploading(true);
    for (const file of fileArray) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${listingId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("listing-photos")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadErr) {
        setError(`Upload failed: ${uploadErr.message}`);
        setUploading(false);
        return;
      }

      const url = `${supabaseUrl}/storage/v1/object/public/listing-photos/${path}`;
      const result = await addPhotoAction(listingId, url, "");
      if (result.error) {
        setError(`Save failed: ${result.error}`);
        setUploading(false);
        return;
      }
    }

    setUploading(false);
    window.location.reload();
  }, [listingId, supabaseUrl]);

  const handleDelete = useCallback(async (image: ListingImage) => {
    if (!confirm("Delete this photo?")) return;
    const storagePath = image.url.includes("/listing-photos/")
      ? image.url.split("/listing-photos/")[1]
      : "";
    const result = await deletePhotoAction(image.id, storagePath, listingId);
    if (result.error) { setError(result.error); return; }
    setImages((prev) => prev.filter((img) => img.id !== image.id));
  }, [listingId]);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(index, 0, moved);
      return updated;
    });
    setDragIndex(index);
  };

  const handleDragEnd = async () => {
    setDragIndex(null);
    await reorderPhotosAction(listingId, images.map((img) => img.id));
  };

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-800">✕</button>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileRef.current?.click()}
        className={`mb-8 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragOver ? "border-[var(--accent)] bg-orange-50" : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-orange-50/50"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        {uploading ? (
          <>
            <div className="mb-2 w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Uploading...</p>
          </>
        ) : (
          <>
            <div className="mb-2 text-3xl text-[var(--muted)]">↑</div>
            <p className="text-sm font-medium">Click to upload or drag &amp; drop</p>
            <p className="mt-1 text-xs text-[var(--muted)]">JPG, PNG, WebP · Max 5MB each</p>
          </>
        )}
      </div>

      {images.length === 0 ? (
        <div className="py-12 text-center text-sm text-[var(--muted)]">
          No photos yet. Upload the first one above.
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-[var(--muted)]">
            Drag photos to reorder. First photo is the cover image.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`group relative aspect-[4/3] overflow-hidden rounded-xl bg-[var(--surface)] cursor-grab active:cursor-grabbing ${
                  dragIndex === index ? "opacity-50 ring-2 ring-[var(--accent)]" : ""
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.alt_text || `Photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/50 via-transparent p-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-semibold text-white bg-black/40 px-2 py-0.5 rounded">
                    {index === 0 ? "Cover" : `#${index + 1}`}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(image); }}
                    className="text-xs font-medium text-red-300 hover:text-white bg-black/40 px-2 py-0.5 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-white text-xs font-semibold px-2 py-0.5 rounded shadow">
                    Cover
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
