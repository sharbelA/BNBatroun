"use client";

import { useState } from "react";

const LINE_LIMIT = 3;

export default function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  const paragraphs = text.split("\n\n").filter(Boolean);
  const isTruncatable = paragraphs.length > LINE_LIMIT;

  const displayed = expanded ? paragraphs : paragraphs.slice(0, LINE_LIMIT);

  return (
    <div>
      <div className="text-[var(--foreground)] leading-relaxed space-y-3">
        {displayed.map((p, i) => (
          <p key={i} className="text-[15px] whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
      {isTruncatable && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-sm font-semibold underline hover:no-underline transition-all"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
