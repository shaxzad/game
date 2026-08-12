/**
 * Tiny helpers shared by the API Route Handlers: query-string parsing and a
 * consistent JSON error shape. Keeping these here means every endpoint reads
 * and validates parameters the same way.
 */
import { NextResponse } from "next/server";
import type { AppFilters, AppSortField, PaginationMeta, SortOrder } from "@/types/api";

/** Consistent error envelope: `{ error }` with the right status code. */
export function jsonError(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function intParam(sp: URLSearchParams, key: string): number | undefined {
  const raw = sp.get(key);
  if (raw == null || raw === "") return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : undefined;
}

export function floatParam(sp: URLSearchParams, key: string): number | undefined {
  const raw = sp.get(key);
  if (raw == null || raw === "") return undefined;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : undefined;
}

const SORT_FIELDS: readonly AppSortField[] = [
  "score",
  "rating",
  "trust",
  "reviews",
  "updated",
  "name",
];

export function parseSort(sp: URLSearchParams): AppSortField | undefined {
  const v = sp.get("sort");
  return v && (SORT_FIELDS as readonly string[]).includes(v)
    ? (v as AppSortField)
    : undefined;
}

export function parseOrder(sp: URLSearchParams): SortOrder | undefined {
  const v = sp.get("order");
  return v === "asc" || v === "desc" ? v : undefined;
}

/** Parse the standard app list filters from a query string. */
export function parseAppFilters(sp: URLSearchParams): AppFilters {
  return {
    search: sp.get("search") ?? sp.get("q") ?? undefined,
    genre: sp.get("genre") ?? undefined,
    category: sp.get("category") ?? undefined,
    minScore: floatParam(sp, "minScore"),
    minReviews: intParam(sp, "minReviews"),
    sort: parseSort(sp),
    order: parseOrder(sp),
    page: intParam(sp, "page"),
    limit: intParam(sp, "limit"),
  };
}

export function paginationMeta(total: number, page: number, limit: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
