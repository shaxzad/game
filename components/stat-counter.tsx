"use client";

import * as React from "react";
import { useCountUp } from "@/hooks/use-count-up";

/**
 * Animated stat for the hero and about page. Counts up from zero when scrolled
 * into view (instant under reduced motion, via the hook).
 */
export function StatCounter({
  value,
  label,
  suffix = "",
  prefix = "",
}: {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
}) {
  const { ref, value: current } = useCountUp(value, 1400);
  return (
    <div ref={ref as React.Ref<HTMLDivElement>}>
      <dd className="font-display text-3xl font-bold tabular-nums tracking-tight">
        {prefix}
        {Math.round(current)}
        {suffix}
      </dd>
      <dt className="mt-1 text-xs text-muted-foreground">{label}</dt>
    </div>
  );
}
