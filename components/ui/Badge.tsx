/**
 * Badge — small label/tag for status, categories, features.
 *
 * Usage:
 *   <Badge>Guest favourite</Badge>
 *   <Badge variant="accent">New</Badge>
 */

import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "accent" | "outline";
  className?: string;
}

const variants = {
  default:
    "bg-white text-[var(--foreground)] shadow-sm",
  accent:
    "bg-[var(--accent)] text-white",
  outline:
    "bg-transparent border border-[var(--border)] text-[var(--foreground)]",
} as const;

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
