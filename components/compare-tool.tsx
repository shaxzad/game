"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Plus, X } from "lucide-react";
import type { CasinoApp } from "@/types";
import { AppLogo } from "@/components/app-logo";
import { RatingStars } from "@/components/rating-stars";
import { CTAButton } from "@/components/cta-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const MAX = 3;

/**
 * Interactive comparison for the Compare page. Users pick up to three apps and
 * see their headline metrics side by side; rows highlight the best value.
 */
export function CompareTool({
  apps,
  initialSlugs = [],
}: {
  apps: CasinoApp[];
  initialSlugs?: string[];
}) {
  const bySlug = React.useMemo(
    () => new Map(apps.map((a) => [a.slug, a])),
    [apps]
  );

  const [selected, setSelected] = React.useState<string[]>(() => {
    const valid = initialSlugs.filter((s) => bySlug.has(s)).slice(0, MAX);
    if (valid.length) return valid;
    return apps.slice(0, 2).map((a) => a.slug);
  });

  const chosen = selected.map((s) => bySlug.get(s)!).filter(Boolean);
  const canAdd = selected.length < MAX;
  const remaining = apps.filter((a) => !selected.includes(a.slug));

  function addApp(slug: string) {
    if (slug && canAdd) setSelected((prev) => [...prev, slug]);
  }
  function removeApp(slug: string) {
    setSelected((prev) => prev.filter((s) => s !== slug));
  }

  const bestTrust = Math.max(...chosen.map((a) => a.trustScore), 0);
  const bestRating = Math.max(...chosen.map((a) => a.rating), 0);
  const cheapest = Math.min(...chosen.map((a) => a.minDeposit));
  const mostGames = Math.max(...chosen.map((a) => a.gamesCount), 0);

  const rows: {
    label: string;
    render: (a: CasinoApp) => React.ReactNode;
    best?: (a: CasinoApp) => boolean;
  }[] = [
    {
      label: "Overall rating",
      render: (a) => <RatingStars value={a.rating} size={14} showValue />,
      best: (a) => a.rating === bestRating,
    },
    {
      label: "Trust score",
      render: (a) => <span className="font-semibold tabular-nums">{a.trustScore}/100</span>,
      best: (a) => a.trustScore === bestTrust,
    },
    { label: "Welcome bonus", render: (a) => a.bonus.headline },
    { label: "Wagering", render: (a) => a.bonus.wagering },
    {
      label: "Min deposit",
      render: (a) => `$${a.minDeposit}`,
      best: (a) => a.minDeposit === cheapest,
    },
    { label: "Payout time", render: (a) => a.payoutTime },
    {
      label: "Games",
      render: (a) => a.gamesCount.toLocaleString(),
      best: (a) => a.gamesCount === mostGames,
    },
    { label: "Licenses", render: (a) => a.license.join(", ") },
    { label: "Platforms", render: (a) => a.platforms.join(", ") },
    {
      label: "Established",
      render: (a) => String(a.established),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {chosen.map((a) => (
          <span
            key={a.slug}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1.5 pr-3 text-sm"
          >
            <AppLogo seed={a.logoSeed} monogram={a.monogram} size={24} rounded="rounded-lg" />
            {a.name}
            <button
              onClick={() => removeApp(a.slug)}
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Remove ${a.name}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        {canAdd && (
          <div className="w-[220px]">
            <Select value="" onValueChange={addApp}>
              <SelectTrigger className="h-9">
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Plus className="h-4 w-4" />
                  Add app to compare
                </span>
              </SelectTrigger>
              <SelectContent>
                {remaining.map((a) => (
                  <SelectItem key={a.slug} value={a.slug}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {chosen.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Add an app to start comparing.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-40 p-4 text-left font-medium text-muted-foreground">
                  {" "}
                </th>
                {chosen.map((a) => (
                  <th key={a.slug} className="min-w-[200px] p-4 text-left align-bottom">
                    <div className="flex flex-col gap-2">
                      <AppLogo seed={a.logoSeed} monogram={a.monogram} size={40} />
                      <Link
                        href={`/reviews/${a.slug}`}
                        className="font-display text-base font-semibold hover:text-primary"
                      >
                        {a.name}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium text-muted-foreground">{row.label}</td>
                  {chosen.map((a) => {
                    const isBest = row.best?.(a) && chosen.length > 1;
                    return (
                      <td
                        key={a.slug}
                        className={cn(
                          "p-4 align-middle",
                          isBest && "bg-primary/[0.06]"
                        )}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {isBest && <Check className="h-3.5 w-3.5 text-primary" />}
                          <span className={cn(isBest && "font-semibold text-primary")}>
                            {row.render(a)}
                          </span>
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td className="p-4" />
                {chosen.map((a) => (
                  <td key={a.slug} className="p-4">
                    <CTAButton href={a.affiliateUrl} size="sm" className="w-full">
                      Visit
                    </CTAButton>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
