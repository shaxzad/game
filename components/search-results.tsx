"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileText, Newspaper, LayoutGrid } from "lucide-react";
import type { CasinoApp, Guide, NewsArticle } from "@/types";
import { AppCard } from "@/components/app-card";
import { ArticleCard } from "@/components/article-card";
import { SearchBar } from "@/components/search-bar";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tab = "all" | "apps" | "guides" | "news";

interface SearchResultsProps {
  apps: CasinoApp[];
  guides: Guide[];
  news: NewsArticle[];
}

function matchApp(app: CasinoApp, q: string) {
  return `${app.name} ${app.tagline} ${app.operator} ${app.categories
    .map((c) => c.name)
    .join(" ")} ${app.features.join(" ")}`
    .toLowerCase()
    .includes(q);
}

function matchArticle(a: Guide | NewsArticle, q: string) {
  return `${a.title} ${a.excerpt} ${a.category} ${a.author}`
    .toLowerCase()
    .includes(q);
}

/**
 * Client search experience. Reads `?q=` from the URL and filters the
 * server-provided datasets across apps, guides and news. All data access still
 * flows through the server page's `lib/api` calls — this only filters.
 */
export function SearchResults({ apps, guides, news }: SearchResultsProps) {
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim().toLowerCase();
  const [tab, setTab] = React.useState<Tab>("all");

  const appHits = React.useMemo(
    () => (q ? apps.filter((a) => matchApp(a, q)) : []),
    [apps, q]
  );
  const guideHits = React.useMemo(
    () => (q ? guides.filter((g) => matchArticle(g, q)) : []),
    [guides, q]
  );
  const newsHits = React.useMemo(
    () => (q ? news.filter((n) => matchArticle(n, q)) : []),
    [news, q]
  );

  const total = appHits.length + guideHits.length + newsHits.length;

  const tabs: { key: Tab; label: string; count: number; icon: React.ElementType }[] = [
    { key: "all", label: "All", count: total, icon: LayoutGrid },
    { key: "apps", label: "Apps", count: appHits.length, icon: LayoutGrid },
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
            Find casino apps, reviews, guides and news. Try &ldquo;fast payouts&rdquo;,
            &ldquo;crypto&rdquo; or &ldquo;wagering&rdquo;.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{total}</span> result
              {total === 1 ? "" : "s"} for{" "}
              <span className="font-semibold text-foreground">&ldquo;{q}&rdquo;</span>
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

          {total === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="font-display text-lg font-semibold">No matches</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Nothing matched &ldquo;{q}&rdquo;. Check the spelling or try a broader term.
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
              {showApps && appHits.length > 0 && (
                <section>
                  <div className="mb-5 flex items-center gap-2">
                    <h2 className="font-display text-lg font-semibold">Apps</h2>
                    <Badge variant="muted">{appHits.length}</Badge>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {appHits.map((app, i) => (
                      <Reveal key={app.id} delay={i * 50}>
                        <AppCard app={app} />
                      </Reveal>
                    ))}
                  </div>
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
