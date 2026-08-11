import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  value: number;
  /** out of */
  max?: number;
  size?: number;
  showValue?: boolean;
  className?: string;
}

/**
 * Accessible 5-star rating with fractional fill via a clipped overlay.
 */
export function RatingStars({
  value,
  max = 5,
  size = 16,
  showValue = false,
  className,
}: RatingStarsProps) {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      role="img"
      aria-label={`Rated ${value.toFixed(1)} out of ${max}`}
    >
      <span className="relative inline-flex" style={{ height: size }}>
        <span className="flex text-muted-foreground/30">
          {Array.from({ length: max }).map((_, i) => (
            <Star key={i} style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} />
          ))}
        </span>
        <span
          className="absolute inset-0 flex overflow-hidden text-gold"
          style={{ width: `${pct}%` }}
        >
          {Array.from({ length: max }).map((_, i) => (
            <Star
              key={i}
              style={{ width: size, height: size }}
              className="shrink-0"
              fill="currentColor"
              strokeWidth={0}
            />
          ))}
        </span>
      </span>
      {showValue && (
        <span className="text-sm font-semibold tabular-nums">{value.toFixed(1)}</span>
      )}
    </span>
  );
}
