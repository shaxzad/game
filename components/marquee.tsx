import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Infinite marquee. Duplicates its children and translates on a CSS keyframe
 * (`animate-marquee`), pausing on hover and freezing under reduced motion.
 * Used for the "as reviewed against" trust strip on the homepage.
 */
export function Marquee({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex overflow-hidden [--gap:3rem] [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className
      )}
    >
      {[0, 1].map((k) => (
        <div
          key={k}
          aria-hidden={k === 1}
          className="flex shrink-0 items-center gap-[--gap] pr-[--gap] animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        >
          {children}
        </div>
      ))}
    </div>
  );
}
