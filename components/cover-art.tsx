import * as React from "react";
import { gradientFromSeed } from "@/utils/gradient";
import { cn } from "@/lib/utils";

/**
 * Network-free cover art. A seeded gradient with a soft vault-grid overlay and
 * an optional kicker label, used for guides, news and screenshot mocks.
 */
export function CoverArt({
  seed,
  label,
  className,
  ratio = "aspect-[16/9]",
}: {
  seed: string;
  label?: string;
  className?: string;
  ratio?: string;
}) {
  const g = gradientFromSeed(seed);
  return (
    <div
      className={cn("relative w-full overflow-hidden", ratio, className)}
      style={{ backgroundImage: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})` }}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      {label && (
        <span className="absolute bottom-3 left-3 rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
          {label}
        </span>
      )}
    </div>
  );
}
