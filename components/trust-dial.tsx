"use client";

import * as React from "react";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";

interface TrustDialProps {
  /** 0–100 */
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
}

function ratingBand(score: number) {
  if (score >= 90) return { label: "Excellent", color: "hsl(var(--gold))" };
  if (score >= 80) return { label: "Very good", color: "hsl(var(--primary))" };
  if (score >= 70) return { label: "Good", color: "hsl(var(--primary))" };
  return { label: "Fair", color: "hsl(var(--muted-foreground))" };
}

/**
 * The AceVault signature: a circular "Trust Dial" gauge. Animates its arc and
 * count from zero when scrolled into view; band label reflects the score.
 */
export function TrustDial({
  score,
  size = 132,
  stroke = 10,
  label = "Trust score",
  className,
}: TrustDialProps) {
  const { ref, value } = useCountUp(score, 1400);
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;
  const band = ratingBand(score);

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
          className="opacity-40"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={band.color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.1s linear" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-3xl font-bold tabular-nums leading-none">
            {Math.round(clamped)}
          </div>
          <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
        </div>
      </div>
      <span
        className="absolute -bottom-3 rounded-full px-2 py-0.5 text-[11px] font-semibold"
        style={{ backgroundColor: `color-mix(in srgb, ${band.color} 16%, transparent)`, color: band.color }}
      >
        {band.label}
      </span>
    </div>
  );
}
