"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import type { CasinoApp, Category, AppSortKey } from "@/types";
import { AppCard } from "@/components/app-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_LABELS, sortApps } from "@/utils/sort";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

const PLATFORMS = ["iOS", "Android", "Web", "Windows"] as const;
const SORTS: AppSortKey[] = ["trust", "rating", "newest", "bonus", "payout", "name"];

/**
 * Client-side explorer for the Casino Apps page. Filters an already-fetched
 * (server) list of apps by search, category, platform and min-trust, and keeps
 * the active category in the URL so category links deep-link correctly.
 */
export function AppsExplorer({
  apps,
  categories,
  initialCategory,
}: {
  apps: CasinoApp[];
  categories: Category[];
  initialCategory?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 200);
  const [category, setCategory] = React.useState(initialCategory ?? "all");
  const [platform, setPlatform] = React.useState<string>("all");
  const [minTrust, setMinTrust] = React.useState(0);
  const [sort, setSort] = React.useState<AppSortKey>("trust");

  // Reflect category changes in the URL (shareable / back-button friendly).
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (category && category !== "all") params.set("category", category);
    else params.delete("category");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const filtered = React.useMemo(() => {
    let list = apps.filter((app) => {
      if (category !== "all" && !app.categories.some((c) => c.slug === category))
        return false;
      if (platform !== "all" && !app.platforms.includes(platform as CasinoApp["platforms"][number]))
        return false;
      if (app.trustScore < minTrust) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const hay = `${app.name} ${app.tagline} ${app.categories
          .map((c) => c.name)
          .join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return sortApps(list, sort);
  }, [apps, category, platform, minTrust, debouncedSearch, sort]);

  const activeFilters =
    (category !== "all" ? 1 : 0) +
    (platform !== "all" ? 1 : 0) +
    (minTrust > 0 ? 1 : 0) +
    (search ? 1 : 0);

  function reset() {
    setSearch("");
    setCategory("all");
    setPlatform("all");
    setMinTrust(0);
    setSort("trust");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-sm font-semibold">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </h2>
            {activeFilters > 0 && (
              <button
                onClick={reset}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
                Clear ({activeFilters})
              </button>
            )}
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Search</label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="App name…"
                className="mt-1.5"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <FilterPill active={category === "all"} onClick={() => setCategory("all")}>
                  All
                </FilterPill>
                {categories.map((c) => (
                  <FilterPill
                    key={c.slug}
                    active={category === c.slug}
                    onClick={() => setCategory(c.slug)}
                  >
                    {c.name}
                  </FilterPill>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Platform</label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <FilterPill active={platform === "all"} onClick={() => setPlatform("all")}>
                  Any
                </FilterPill>
                {PLATFORMS.map((p) => (
                  <FilterPill key={p} active={platform === p} onClick={() => setPlatform(p)}>
                    {p}
                  </FilterPill>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Min trust score
                </label>
                <span className="text-xs font-semibold tabular-nums">{minTrust}</span>
              </div>
              <input
                type="range"
                min={0}
                max={95}
                step={5}
                value={minTrust}
                onChange={(e) => setMinTrust(Number(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
            </div>
          </div>
        </div>
      </aside>

      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "app" : "apps"}
            {category !== "all" && (
              <>
                {" "}in{" "}
                <Badge variant="secondary" className="ml-1">
                  {categories.find((c) => c.slug === category)?.name}
                </Badge>
              </>
            )}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort by</span>
            <Select value={sort} onValueChange={(v) => setSort(v as AppSortKey)}>
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SORT_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="font-display text-lg font-semibold">No apps match those filters</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try widening your search or clearing a filter.
            </p>
            <Button onClick={reset} variant="outline" className="mt-4">
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
