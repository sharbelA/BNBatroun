"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { copyListingAction } from "@/app/_actions/listings";

interface Props {
  id: string;
  target: "daily" | "seasonal";
  className?: string;
}

const LABEL = { seasonal: "Copy to seasonal", daily: "Copy to daily" } as const;

export default function CopyListingButton({ id, target, className }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCopy() {
    setError(null);
    startTransition(async () => {
      const result = await copyListingAction(id, target);
      if (result.id) {
        router.push(`/admin/listings/${result.id}/edit`);
      } else if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={handleCopy}
        disabled={isPending}
        className={className ?? "text-sea-600 hover:underline disabled:opacity-50"}
      >
        {isPending ? "Copying…" : LABEL[target]}
      </button>
      {error && <span className="mt-1 max-w-[16rem] text-xs text-red-600">{error}</span>}
    </span>
  );
}
