"use client";

import * as React from "react";
import type { CasinoApp } from "@/types";
import { AppGridInfinite } from "@/components/app-grid-infinite";
import { useInfiniteApps } from "@/hooks/use-infinite-apps";

/**
 * Rating-sorted, infinitely-scrolling grid of every reviewed app. Page 1 is
 * server-rendered (`initialApps`); the rest stream from `/api/apps` on scroll.
 */
export function ReviewsGrid({
  initialApps,
  initialTotal,
}: {
  initialApps: CasinoApp[];
  initialTotal: number;
}) {
  const params = React.useMemo(() => ({ sort: "rating", order: "desc" }), []);
  const { items, total, hasMore, isLoading, isLoadingMore, error, loadMore, reload } =
    useInfiniteApps({
      endpoint: "/api/apps",
      params,
      pageSize: 24,
      initialItems: initialApps,
      initialTotal,
    });

  return (
    <>
      <p className="mb-6 text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground tabular-nums">{items.length}</span> of{" "}
        <span className="font-medium text-foreground tabular-nums">{total}</span>{" "}
        {total === 1 ? "review" : "reviews"}, highest rated first.
      </p>
      <AppGridInfinite
        items={items}
        hasMore={hasMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        error={error}
        onLoadMore={loadMore}
        onRetry={reload}
        gridClassName="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      />
    </>
  );
}
