import * as React from "react";
import { gradientFromSeed } from "@/utils/gradient";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  seed: string;
  monogram: string;
  /** Real logo image URL. When set, the image renders instead of the monogram tile. */
  src?: string;
  /** Accessible label for the image; usually the app name. */
  alt?: string;
  /** pixel size of the square */
  size?: number;
  className?: string;
  rounded?: string;
}

/**
 * App logo tile. Renders the real store icon when `src` is provided, otherwise
 * a deterministic, network-free seeded gradient with the app's monogram. The
 * seeded gradient also backs the tile while a real image loads.
 */
export function AppLogo({
  seed,
  monogram,
  src,
  alt = "",
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
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          width={size}
          height={size}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <>
          <span
            className="absolute inset-[3px] rounded-[inherit] border border-white/15"
            style={{ borderStyle: "dashed" }}
            aria-hidden
          />
          <span
            className="font-display font-bold tracking-tight text-white drop-shadow"
            style={{ fontSize: size * 0.36 }}
            aria-hidden
          >
            {monogram}
          </span>
        </>
      )}
    </div>
  );
}
