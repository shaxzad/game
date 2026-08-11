import type { CasinoApp, AppSortKey } from "@/types";

/** Parse a bonus headline like "100% up to $500" into a comparable number. */
export function bonusValue(app: CasinoApp): number {
  const match = app.bonus.headline.match(/\$?([\d,]+)/);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
}

/** Parse "0–24 hours" style payout windows into an approximate hour count. */
export function payoutHours(app: CasinoApp): number {
  const nums = app.payoutTime.match(/\d+/g)?.map(Number) ?? [999];
  if (/instant|0/i.test(app.payoutTime) && nums[0] === 0) return nums[0];
  return nums[nums.length - 1];
}

export const SORT_LABELS: Record<AppSortKey, string> = {
  trust: "Trust score",
  rating: "Rating",
  newest: "Recently updated",
  name: "Name (A–Z)",
  bonus: "Bonus size",
  payout: "Fastest payout",
};

export function sortApps(apps: CasinoApp[], sort: AppSortKey = "trust"): CasinoApp[] {
  const copy = [...apps];
  switch (sort) {
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "newest":
      return copy.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "bonus":
      return copy.sort((a, b) => bonusValue(b) - bonusValue(a));
    case "payout":
      return copy.sort((a, b) => payoutHours(a) - payoutHours(b));
    case "trust":
    default:
      return copy.sort((a, b) => b.trustScore - a.trustScore);
  }
}
