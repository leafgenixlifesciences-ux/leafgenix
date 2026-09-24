"use client";

import { Minus, Plus } from "lucide-react";
import { MAX_QTY_PER_LINE } from "@/lib/shipping";

export function QuantityStepper({
  value,
  onChange,
  max = MAX_QTY_PER_LINE,
  size = "md",
  label = "Quantity",
}: {
  value: number;
  onChange: (next: number) => void;
  max?: number;
  size?: "sm" | "md";
  label?: string;
}) {
  const ceiling = Math.min(max, MAX_QTY_PER_LINE);
  const dim = size === "sm" ? "h-8 w-8" : "h-11 w-11";

  return (
    <div
      className="inline-flex items-center rounded-full border border-line-strong bg-white"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className={`${dim} grid place-items-center rounded-full transition-colors hover:bg-surface disabled:opacity-30`}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2.2} />
      </button>
      <span
        className={`${size === "sm" ? "w-7 text-sm" : "w-9"} text-center font-medium tabular-nums`}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className={`${dim} grid place-items-center rounded-full transition-colors hover:bg-surface disabled:opacity-30`}
        disabled={value >= ceiling}
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
      </button>
    </div>
  );
}
