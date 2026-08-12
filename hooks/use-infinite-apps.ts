"use client";

import * as React from "react";
import type { CasinoApp } from "@/types";

/** The `{ data, pagination }` envelope every list endpoint returns. */
interface ApiListResponse {
  data: CasinoApp[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

/** A query param value we know how to serialise. */
type ParamValue = string | number | boolean | undefined | null;

export interface UseInfiniteAppsOptions {
  /** List endpoint to page through. Must return `{ data, pagination }`. */
  endpoint?: string;
  /**
   * Filters (everything except page/limit). Changing any value RESETS the list
   * back to page 1 — the hook keys off a serialised snapshot of this object, so
   * you can safely pass a fresh object literal each render.
   */
  params?: Record<string, ParamValue>;
  /** Items fetched per page. */
  pageSize?: number;
  /** Page-1 data rendered on the server, so the first paint needs no fetch. */
  initialItems?: CasinoApp[];
  /** Total matching count from the same server render as `initialItems`. */
  initialTotal?: number;
  /** When false the hook holds an empty result and issues no requests. */
  enabled?: boolean;
}

export interface UseInfiniteAppsResult {
  items: CasinoApp[];
  total: number;
  /** True while more pages remain to be fetched. */
  hasMore: boolean;
  /** Initial page load (no seed) is in flight. */
  isLoading: boolean;
  /** A subsequent page is being appended. */
  isLoadingMore: boolean;
  error: string | null;
  loadMore: () => void;
  reload: () => void;
}

/** Serialise filters + pagination into a stable query string. */
function buildQuery(params: Record<string, ParamValue>, page: number, limit: number): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  sp.set("page", String(page));
  sp.set("limit", String(limit));
  return sp.toString();
}

/**
 * Cursor-free infinite scroll over a paginated list endpoint.
 *
 * - Seeds from server-rendered page 1 (`initialItems`) so there is no fetch on
 *   first paint; only scrolling or changing a filter hits the network.
 * - Cancels in-flight requests with an AbortController when filters change, so
 *   a slow page never overwrites a newer result.
 * - Dedupes by slug when appending, guarding against overlap if the underlying
 *   data shifts between page reads.
 */
export function useInfiniteApps({
  endpoint = "/api/apps",
  params = {},
  pageSize = 24,
  initialItems,
  initialTotal,
  enabled = true,
}: UseInfiniteAppsOptions = {}): UseInfiniteAppsResult {
  // A string that changes iff the filters change (page/limit are neutralised).
  const paramsKey = React.useMemo(
    () => `${endpoint}|${buildQuery(params, 0, pageSize)}`,
    [endpoint, params, pageSize],
  );

  // Latest params in a ref so `fetchPage` can read them without being a new
  // callback every render (which would thrash the effects below).
  const paramsRef = React.useRef(params);
  paramsRef.current = params;

  // The key the SSR seed corresponds to. Consumed once so later filter changes
  // (or a return to the original filters) always refetch.
  const seedKeyRef = React.useRef<string | null>(initialItems ? paramsKey : null);
  const seeded = seedKeyRef.current === paramsKey && initialItems != null;

  const [items, setItems] = React.useState<CasinoApp[]>(seeded ? initialItems! : []);
  const [total, setTotal] = React.useState<number>(
    seeded ? (initialTotal ?? initialItems!.length) : 0,
  );
  const [page, setPage] = React.useState<number>(seeded ? 1 : 0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const abortRef = React.useRef<AbortController | null>(null);

  const fetchPage = React.useCallback(
    async (nextPage: number, append: boolean) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      if (append) setIsLoadingMore(true);
      else setIsLoading(true);
      setError(null);
      try {
        const qs = buildQuery(paramsRef.current, nextPage, pageSize);
        const res = await fetch(`${endpoint}?${qs}`, {
          signal: controller.signal,
          headers: { accept: "application/json" },
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const body = (await res.json()) as ApiListResponse;
        const data = Array.isArray(body?.data) ? body.data : [];
        const tot = body?.pagination?.total ?? data.length;
        setItems((prev) => {
          if (!append) return data;
          const seen = new Set(prev.map((a) => a.slug));
          return [...prev, ...data.filter((a) => !seen.has(a.slug))];
        });
        setTotal(tot);
        setPage(nextPage);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError((e as Error).message || "Failed to load apps");
      } finally {
        // Only the most recent request is allowed to clear the busy flags.
        if (abortRef.current === controller) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [endpoint, pageSize],
  );

  // Reset + load page 1 whenever the filters change (or on mount, unless the
  // server already seeded this exact filter set).
  React.useEffect(() => {
    if (!enabled) {
      abortRef.current?.abort();
      setItems([]);
      setTotal(0);
      setPage(0);
      setIsLoading(false);
      setIsLoadingMore(false);
      setError(null);
      return;
    }
    if (seedKeyRef.current === paramsKey) {
      seedKeyRef.current = null; // consume the seed once
      return;
    }
    fetchPage(1, false);
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, enabled]);

  const hasMore = enabled && !isLoading && items.length < total;

  const loadMore = React.useCallback(() => {
    if (isLoading || isLoadingMore) return;
    if (items.length >= total) return;
    fetchPage(page + 1, true);
  }, [isLoading, isLoadingMore, items.length, total, page, fetchPage]);

  const reload = React.useCallback(() => {
    seedKeyRef.current = null;
    fetchPage(1, false);
  }, [fetchPage]);

  return { items, total, hasMore, isLoading, isLoadingMore, error, loadMore, reload };
}
