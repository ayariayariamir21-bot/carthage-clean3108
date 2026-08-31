import type { ReactNode } from "react";

type Tone = "brand" | "green" | "slate" | "amber";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-100 text-brand-700",
  green: "bg-accent-100 text-accent-700",
  slate: "bg-slate-100 text-slate-600",
  amber: "bg-amber-100 text-amber-700",
};

export function Badge({
  tone = "brand",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
