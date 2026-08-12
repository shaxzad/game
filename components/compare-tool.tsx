"use client";

import * as React from "react";
import Link from "next/link";
import { Check, X, Search, Loader2 } from "lucide-react";
import type { CasinoApp } from "@/types";
import { AppLogo } from "@/components/app-logo";
import { RatingStars } from "@/components/rating-stars";
import { CTAButton } from "@/components/cta-button";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatCompact } from "@/utils/format";
import { cn } from "@/lib/utils";

const MAX = 3;

/**
 * Interactive comparison for the Compare page. Users pick up to three apps and
 * see their headline metrics side by side; rows highlight the best value.
 *
 * Apps to add are searched live across the WHOLE database via `/api/search`, so
 * every row is backed by real Google-Play data (no synthetic bonus/wagering
 * fields). Initial apps are resolved server-side from the `?apps=` slugs.
 */
export function CompareTool({ initialApps }: { initialApps: CasinoApp[] }) {
  // A growing cache of every app we've seen (seeded + added from search).
  const [known, setKnown] = React.useState<Map<string, CasinoApp>>(
    () => new Map(initialApps.map((a) => [a.slug, a]))
  );
  const [selected, setSelected] = React.useState<string[]>(() =>
    initialApps.slice(0, MAX).map((a) => a.slug)
  );

  const chosen = selected.map((s) => known.get(s)).filter((a): a is CasinoApp => Boolean(a));
  const canAdd = selected.length < MAX;

  function addApp(app: CasinoApp) {
    setKnown((prev) => (prev.has(app.slug) ? prev : new Map(prev).set(app.slug, app)));
    setSelected((prev) =>
      prev.includes(app.slug) || prev.length >= MAX ? prev : [...prev, app.slug]
    );
  }
  function removeApp(slug: string) {
    setSelected((prev) => prev.filter((s) => s !== slug));
  }

  const bestTrust = Math.max(...chosen.map((a) => a.trustScore), 0);
  const bestRating = Math.max(...chosen.map((a) => a.rating), 0);
  const mostReviews = Math.max(...chosen.map((a) => a.reviewsCount), 0);

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
    {
      label: "Reviews",
      render: (a) => formatCompact(a.reviewsCount),
      best: (a) => a.reviewsCount === mostReviews && mostReviews > 0,
    },
    { label: "Installs", render: (a) => a.installs || "—" },
    { label: "Category", render: (a) => a.categories.map((c) => c.name).join(", ") || "—" },
    { label: "Content rating", render: (a) => a.contentRating || "—" },
    { label: "Developer", render: (a) => a.operator },
    { label: "Version", render: (a) => a.version || "—" },
    { label: "Established", render: (a) => (a.established ? String(a.established) : "—") },
    { label: "Platforms", render: (a) => a.platforms.join(", ") },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {chosen.map((a) => (
          <span
            key={a.slug}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1.5 pr-3 text-sm"
          >
            <AppLogo seed={a.logoSeed} monogram={a.monogram} src={a.logoUrl} alt={a.name} size={24} rounded="rounded-lg" />
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
          <CompareAddSearch excludeSlugs={selected} onAdd={addApp} />
        )}
      </div>

      {chosen.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Search for an app above to start comparing.
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
                      <AppLogo seed={a.logoSeed} monogram={a.monogram} src={a.logoUrl} alt={a.name} size={40} />
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

/** Debounced, whole-database app picker backed by `/api/search`. */
function CompareAddSearch({
  excludeSlugs,
  onAdd,
}: {
  excludeSlugs: string[];
  onAdd: (app: CasinoApp) => void;
}) {
  const [q, setQ] = React.useState("");
  const dq = useDebouncedValue(q, 250);
  const [results, setResults] = React.useState<CasinoApp[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    const term = dq.trim();
    if (!term) {
      setResults([]);
      setLoading(false);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(term)}&limit=8`, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((body) => setResults(Array.isArray(body?.data) ? body.data : []))
      .catch((e) => {
        if ((e as Error).name !== "AbortError") setResults([]);
      })
      .finally(() => {
        if (abortRef.current === controller) setLoading(false);
      });
    return () => controller.abort();
  }, [dq]);

  const visible = results.filter((a) => !excludeSlugs.includes(a.slug));

  return (
    <div className="relative w-[260px]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search apps to add…"
          className="h-9 pl-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>
      {open && q.trim() && (
        <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-border bg-popover p-1 shadow-lg">
          {visible.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              {loading ? "Searching…" : "No apps found"}
            </p>
          ) : (
            visible.map((a) => (
              <button
                key={a.slug}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onAdd(a);
                  setQ("");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                <AppLogo seed={a.logoSeed} monogram={a.monogram} src={a.logoUrl} alt={a.name} size={24} rounded="rounded-lg" />
                <span className="min-w-0 flex-1 truncate">{a.name}</span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {a.rating.toFixed(1)}★
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
