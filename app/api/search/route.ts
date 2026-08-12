/**
 * GET /api/search?q=...
 *
 * Full-text-ish search across title, developer, package name, genre, summary and
 * the scraper's discovery queries. Paginated and sortable like /api/apps.
 *
 * Query params: q | search, page, limit, sort, order
 * Response: { data: CasinoApp[], pagination: {...} }
 */
import type { CasinoApp } from "@/types";
import type { ApiListResponse } from "@/types/api";
import { NextResponse } from "next/server";
import { findApps } from "@/lib/mongo-service";
import { intParam, jsonError, paginationMeta, parseOrder, parseSort } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? searchParams.get("search") ?? "";
    const { items, total, page, limit } = await findApps({
      search: q,
      page: intParam(searchParams, "page"),
      limit: intParam(searchParams, "limit"),
      sort: parseSort(searchParams),
      order: parseOrder(searchParams),
    });
    const body: ApiListResponse<CasinoApp> = {
      data: items,
      pagination: paginationMeta(total, page, limit),
    };
    return NextResponse.json(body);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Search failed");
  }
}
