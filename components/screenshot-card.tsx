import * as React from "react";
import type { Screenshot } from "@/types";
import { gradientFromSeed } from "@/utils/gradient";
import { cn } from "@/lib/utils";

/**
 * A phone-framed, network-free screenshot mock. Renders a seeded gradient with
 * a stylised app chrome so the review's "Screenshots" section has real texture
 * without shipping any images.
 */
export function ScreenshotCard({
  shot,
  className,
}: {
  shot: Screenshot;
  className?: string;
}) {
  const g = gradientFromSeed(shot.seed);
  return (
    <figure className={cn("shrink-0", className)}>
      <div className="relative aspect-[9/19] w-full overflow-hidden rounded-[1.75rem] border border-border bg-card p-2 shadow-card">
        <div
          className="relative h-full w-full overflow-hidden rounded-[1.35rem]"
          style={{ backgroundImage: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})` }}
        >
          <div className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-black/25" />
          <div className="absolute inset-x-3 top-8 space-y-2">
            <div className="h-6 w-2/3 rounded-md bg-white/20" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-white/15" />
              ))}
            </div>
          </div>
          <div className="absolute inset-x-3 bottom-3 h-10 rounded-xl bg-black/30 backdrop-blur" />
        </div>
      </div>
      <figcaption className="mt-2 text-center text-xs text-muted-foreground">
        {shot.caption}
      </figcaption>
    </figure>
  );
}
