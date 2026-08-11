import type { Screenshot } from "@/types";
import { gradientFromSeed } from "@/utils/gradient";

/**
 * Deterministic mock screenshots.
 *
 * Real CMS content will ship image URLs; until then we generate stable,
 * pretty placeholder specs from a per-app seed so the review page's
 * screenshot gallery looks intentional.
 */
const TEMPLATES = [
  { caption: "Lobby", title: "Today's picks" },
  { caption: "Game grid", title: "Browse games" },
  { caption: "Promotions", title: "Offers" },
  { caption: "Cashier", title: "Deposit" },
] as const;

export function screenshotsFor(seed: string): Screenshot[] {
  const g = gradientFromSeed(seed);
  return TEMPLATES.map((t, i) => ({
    seed: `${seed}-${i}-${g.hue}`,
    caption: t.caption,
  }));
}
