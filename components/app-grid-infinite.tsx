"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import type { CasinoApp } from "@/types";
import { AppCard } from "@/components/app-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AppGridInfiniteProps {
  items: CasinoApp[];
  hasMore: boolean;
  /** Initial page load (nothing shown yet). */
  isLoading: boolean;
  /** A further page is being appended. */
  isLoadingMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onRetry?: () => void;
  /** Tailwind grid classes; defaults to the standard 1/2/3-column layout. */
  gridClassName?: string;
  /** How many skeleton tiles to show during the initial load. */
  skeletonCount?: number;
  emptyState?: React.ReactNode;
  className?: string;
}

/**
 * Renders a responsive grid of AppCards and drives infinite scroll: an
 * off-screen sentinel is watched by an IntersectionObserver and asks the parent
 * hook for the next page as it approaches the viewport. A manual "Load more"
 * button is always available as a keyboard-accessible / no-observer fallback.
 */
export function AppGridInfinite({
  items,
  hasMore,
  isLoading,
  isLoadingMore,
  error,
  onLoadMore,
  onRetry,
  gridClassName = "grid gap-5 sm:grid-cols-2 xl:grid-cols-3",
  skeletonCount = 6,
  emptyState,
  className,
}: AppGridInfiniteProps) {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  // Keep the latest callback in a ref so the observer effect doesn't need to
  // re-subscribe every time the parent passes a new function identity.
  const loadMoreRef = React.useRef(onLoadMore);
  loadMoreRef.current = onLoadMore;

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMoreRef.current();
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
    // Re-arm after each batch loads (sentinel position changes) and when the
    // "more available" state flips.
  }, [hasMore, isLoadingMore, items.length]);

  // Initial load with nothing to show yet → skeleton grid.
  if (isLoading && items.length === 0) {
    return (
      <div className={cn(gridClassName, className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <AppCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // No results (and not loading) → empty state.
  if (!isLoading && items.length === 0) {
    return (
      <>
        {emptyState ?? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="font-display text-lg font-semibold">No apps found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try widening your search or clearing a filter.
            </p>
          </div>
        )}
        {error && <LoadError error={error} onRetry={onRetry} />}
      </>
    );
  }

  return (
    <div className={className}>
      <div className={gridClassName}>
        {items.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
        {isLoadingMore &&
          Array.from({ length: 3 }).map((_, i) => <AppCardSkeleton key={`more-${i}`} />)}
      </div>

      {error && <LoadError error={error} onRetry={onRetry} />}

      {hasMore && !error && (
        <div className="mt-8 flex flex-col items-center gap-3">
          {/* Sentinel: observed to auto-load as it nears the viewport. */}
          <div ref={sentinelRef} aria-hidden className="h-px w-full" />
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="min-w-[160px]"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading…
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function LoadError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-center text-sm">
      <p className="text-destructive">Couldn’t load apps: {error}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
          Try again
        </Button>
      )}
    </div>
  );
}

/** Card-shaped placeholder that mirrors AppCard's footprint. */
function AppCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="h-[52px] w-[52px] rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <Skeleton className="h-8 w-10" />
      </div>
      <Skeleton className="mt-4 h-12 w-full" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="mt-4 h-4 w-full" />
    </div>
  );
}
