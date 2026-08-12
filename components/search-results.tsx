"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileText, Newspaper, LayoutGrid, Loader2 } from "lucide-react";
import type { Guide, NewsArticle } from "@/types";
import { AppCard } from "@/components/app-card";
import { AppGridInfinite } from "@/components/app-grid-infinite";
import { ArticleCard } from "@/components/article-card";
import { SearchBar } from "@/components/search-bar";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInfiniteApps } from "@/hooks/use-infinite-apps";
import { cn } from "@/lib/utils";

type Tab = "all" | "apps" | "guides" | "news";

/** Apps shown in the combined "All" tab before offering "see all". */
const APP_PREVIEW = 6;

interface SearchResultsProps {
  guides: Guide[];
  news: NewsArticle[];
}

function matchArticle(a: Guide | NewsArticle, q: string) {
  return `${a.title} ${a.excerpt} ${a.category} ${a.author}`
    .toLowerCase()
    .includes(q);
}

/**
 * Client search experience. Apps are searched SERVER-SIDE across the whole
 * database via `/api/search` (with infinite scroll), so results are never
 * limited to a pre-loaded page. Guides and news are a small editorial set, so
 * they stay filtered in-memory from the server-provided lists.
 */
export function SearchResults({ guides, news }: SearchResultsProps) {
  const params = useSearchParams();
  const rawQ = (params.get("q") ?? "").trim();
  const q = rawQ.toLowerCase();
  const [tab, setTab] = React.useState<Tab>("all");

  const appParams = React.useMemo(() => ({ q: rawQ }), [rawQ]);
  const {
    items: appHits,
    total: appsTotal,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    reload,
  } = useInfiniteApps({
    endpoint: "/api/search",
    params: appParams,
    pageSize: 12,
    enabled: q.length > 0,
  });

  const guideHits = React.useMemo(
    () => (q ? guides.filter((g) => matchArticle(g, q)) : []),
    [guides, q]
  );
  const newsHits = React.useMemo(
    () => (q ? news.filter((n) => matchArticle(n, q)) : []),
    [news, q]
  );

  const total = appsTotal + guideHits.length + newsHits.length;
  const noResults = q.length > 0 && !isLoading && total === 0;

  const tabs: { key: Tab; label: string; count: number; icon: React.ElementType }[] = [
    { key: "all", label: "All", count: total, icon: LayoutGrid },
    { key: "apps", label: "Apps", count: appsTotal, icon: LayoutGrid },
    { key: "guides", label: "Guides", count: guideHits.length, icon: FileText },
    { key: "news", label: "News", count: newsHits.length, icon: Newspaper },
  ];

  const showApps = tab === "all" || tab === "apps";
  const showGuides = tab === "all" || tab === "guides";
  const showNews = tab === "all" || tab === "news";

  return (
    <div className="container-tight py-10">
      <div className="mx-auto max-w-2xl">
        <SearchBar defaultValue={params.get("q") ?? ""} autoFocus size="lg" />
      </div>

      {!q ? (
        <div className="mx-auto mt-12 max-w-md text-center">
          <p className="font-display text-lg font-semibold">Search AceVault</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Find casino apps, reviews, guides and news. Try &ldquo;poker&rdquo;,
            &ldquo;slots&rdquo; or &ldquo;blackjack&rdquo;.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Searching for{" "}
                  <span className="font-semibold text-foreground">&ldquo;{rawQ}&rdquo;</span>
                </span>
              ) : (
                <>
                  <span className="font-semibold text-foreground tabular-nums">{total}</span>{" "}
                  result{total === 1 ? "" : "s"} for{" "}
                  <span className="font-semibold text-foreground">&ldquo;{rawQ}&rdquo;</span>
                </>
              )}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    tab === t.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                  <span className="tabular-nums opacity-70">{t.count}</span>
                </button>
              ))}
            </div>
          </div>

          {noResults ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="font-display text-lg font-semibold">No matches</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Nothing matched &ldquo;{rawQ}&rdquo;. Check the spelling or try a broader term.
              </p>
              <Link
                href="/apps"
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                Browse all apps instead
              </Link>
            </div>
          ) : (
            <div className="mt-10 space-y-12">
              {showApps && (appsTotal > 0 || isLoading) && (
                <section>
                  <div className="mb-5 flex items-center gap-2">
                    <h2 className="font-display text-lg font-semibold">Apps</h2>
                    {appsTotal > 0 && <Badge variant="muted">{appsTotal}</Badge>}
                  </div>

                  {tab === "apps" ? (
                    // Dedicated tab: full infinite scroll across the whole DB.
                    <AppGridInfinite
                      items={appHits}
                      hasMore={hasMore}
                      isLoading={isLoading}
                      isLoadingMore={isLoadingMore}
                      error={error}
                      onLoadMore={loadMore}
                      onRetry={reload}
                    />
                  ) : (
                    // Combined "All" tab: show a preview, then link to the tab.
                    <AppPreview
                      appHits={appHits}
                      appsTotal={appsTotal}
                      isLoading={isLoading}
                      onSeeAll={() => setTab("apps")}
                    />
                  )}
                </section>
              )}

              {showGuides && guideHits.length > 0 && (
                <section>
                  <div className="mb-5 flex items-center gap-2">
                    <h2 className="font-display text-lg font-semibold">Guides</h2>
                    <Badge variant="muted">{guideHits.length}</Badge>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {guideHits.map((g, i) => (
                      <Reveal key={g.slug} delay={i * 50}>
                        <ArticleCard article={g} basePath="/guides" />
                      </Reveal>
                    ))}
                  </div>
                </section>
              )}

              {showNews && newsHits.length > 0 && (
                <section>
                  <div className="mb-5 flex items-center gap-2">
                    <h2 className="font-display text-lg font-semibold">News</h2>
                    <Badge variant="muted">{newsHits.length}</Badge>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {newsHits.map((n, i) => (
                      <Reveal key={n.slug} delay={i * 50}>
                        <ArticleCard article={n} basePath="/news" />
                      </Reveal>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AppPreview({
  appHits,
  appsTotal,
  isLoading,
  onSeeAll,
}: {
  appHits: import("@/types").CasinoApp[];
  appsTotal: number;
  isLoading: boolean;
  onSeeAll: () => void;
}) {
  if (isLoading && appHits.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        <Loader2 className="mr-1.5 inline h-3.5 w-3.5 animate-spin" />
        Searching apps…
      </p>
    );
  }
  const preview = appHits.slice(0, APP_PREVIEW);
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {preview.map((app, i) => (
          <Reveal key={app.id} delay={i * 50}>
            <AppCard app={app} />
          </Reveal>
        ))}
      </div>
      {appsTotal > preview.length && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={onSeeAll}>
            See all {appsTotal} apps
          </Button>
        </div>
      )}
    </>
  );
}
