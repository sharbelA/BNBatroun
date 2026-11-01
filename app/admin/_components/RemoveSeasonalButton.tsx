"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeSeasonalListingAction } from "@/app/_actions/listings";

interface Props {
  id: string;
  title: string;
}

export default function RemoveSeasonalButton({ id, title }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      const result = await removeSeasonalListingAction(id);
      if (result.error) {
        setError(result.error);
      } else {
        setConfirming(false);
        router.refresh();
      }
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-red-600 hover:underline"
      >
        Remove from seasonal
      </button>
    );
  }

  return (
    <span className="inline-flex flex-col gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
      <span>
        Remove <strong>{title}</strong> from seasonal? Your daily chalet is not affected.
      </span>
      {error && <span className="text-red-600">{error}</span>}
      <span className="flex gap-3">
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          className="font-semibold text-red-700 hover:underline disabled:opacity-50"
        >
          {isPending ? "Removing…" : "Yes, remove"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="text-warm-600 hover:underline"
        >
          Cancel
        </button>
      </span>
    </span>
  );
}
