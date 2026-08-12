"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import type { CasinoApp, Category } from "@/types";
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
import { AppGridInfinite } from "@/components/app-grid-infinite";
import { useInfiniteApps } from "@/hooks/use-infinite-apps";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

/** Apps fetched per page as the user scrolls. */
const PAGE_SIZE = 24;

/**
 * Sort options exposed in the UI, each mapped to the real `/api/apps`
 * sort field + order. Every one is backed by live data — no synthetic
 * bonus/payout sorts (Google Play provides no such fields).
 */
type SortOption = {
  value: string;
  label: string;
  field: "rating" | "reviews" | "updated" | "name";
  order: "asc" | "desc";
};

const SORT_OPTIONS: SortOption[] = [
  { value: "rating", label: "Top rated", field: "rating", order: "desc" },
  { value: "reviews", label: "Most reviewed", field: "reviews", order: "desc" },
  { value: "newest", label: "Recently updated", field: "updated", order: "desc" },
  { value: "name", label: "Name (A–Z)", field: "name", order: "asc" },
];

/**
 * Casino Apps explorer. Filters (search, category, min-trust) and sort all run
 * SERVER-SIDE against the whole database via `/api/apps`; results stream in with
 * infinite scroll. Page 1 is seeded from the server render (`initialApps`) so
 * the first paint is instant and SEO-visible.
 */
export function AppsExplorer({
  initialApps,
  initialTotal,
  categories,
  initialCategory,
}: {
  initialApps: CasinoApp[];
  initialTotal: number;
  categories: Category[];
  initialCategory?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
  const [category, setCategory] = React.useState(initialCategory ?? "all");
  const [minTrust, setMinTrust] = React.useState(0);
  const [sort, setSort] = React.useState<string>("rating");

  // Reflect category changes in the URL (shareable / back-button friendly).
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (category && category !== "all") params.set("category", category);
    else params.delete("category");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // Translate the UI filters into `/api/apps` query params. A new object each
  // render is fine — the hook keys off a serialised snapshot.
  const params = React.useMemo(() => {
    const opt = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];
    return {
      search: debouncedSearch.trim() || undefined,
      category: category !== "all" ? category : undefined,
      // UI trust is 0–100; the API's minScore is 0–5 (trust = score / 5 * 100).
      minScore: minTrust > 0 ? minTrust / 20 : undefined,
      sort: opt.field,
      order: opt.order,
    };
  }, [debouncedSearch, category, minTrust, sort]);

  const { items, total, hasMore, isLoading, isLoadingMore, error, loadMore, reload } =
    useInfiniteApps({
      endpoint: "/api/apps",
      params,
      pageSize: PAGE_SIZE,
      initialItems: initialApps,
      initialTotal,
    });

  const activeFilters =
    (category !== "all" ? 1 : 0) + (minTrust > 0 ? 1 : 0) + (search ? 1 : 0);

  function reset() {
    setSearch("");
    setCategory("all");
    setMinTrust(0);
    setSort("rating");
  }

  const activeCategoryName = categories.find((c) => c.slug === category)?.name;

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
            <span className="font-semibold text-foreground tabular-nums">{total}</span>{" "}
            {total === 1 ? "app" : "apps"}
            {category !== "all" && activeCategoryName && (
              <>
                {" "}in{" "}
                <Badge variant="secondary" className="ml-1">
                  {activeCategoryName}
                </Badge>
              </>
            )}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort by</span>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-9 w-[170px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <AppGridInfinite
          items={items}
          hasMore={hasMore}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          error={error}
          onLoadMore={loadMore}
          onRetry={reload}
          emptyState={
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="font-display text-lg font-semibold">No apps match those filters</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try widening your search or clearing a filter.
              </p>
              <Button onClick={reset} variant="outline" className="mt-4">
                Clear filters
              </Button>
            </div>
          }
        />
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
