import * as React from "react";
import { gradientFromSeed } from "@/utils/gradient";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  seed: string;
  monogram: string;
  /** pixel size of the square */
  size?: number;
  className?: string;
  rounded?: string;
}

/**
 * Deterministic, network-free app logo. A seeded gradient tile with the app's
 * monogram and a subtle vault-ring, so every brand looks intentional offline.
 */
export function AppLogo({
  seed,
  monogram,
  size = 56,
  className,
  rounded = "rounded-2xl",
}: AppLogoProps) {
  const g = gradientFromSeed(seed);
  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden ring-1 ring-inset ring-white/10",
        rounded,
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundImage: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})`,
      }}
      aria-hidden
    >
      <span
        className="absolute inset-[3px] rounded-[inherit] border border-white/15"
        style={{ borderStyle: "dashed" }}
      />
      <span
        className="font-display font-bold tracking-tight text-white drop-shadow"
        style={{ fontSize: size * 0.36 }}
      >
        {monogram}
      </span>
    </div>
  );
}
