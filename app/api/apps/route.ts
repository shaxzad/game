/**
 * GET /api/apps
 *
 * Paginated, filtered, sorted list of apps. Backs the app listings and powers
 * any client-side data fetching that needs server pagination.
 *
 * Query params:
 *   page, limit                      pagination (limit capped server-side)
 *   search | q                       full-text-ish match across title/developer/etc.
 *   genre                            exact Google-Play genre, e.g. "Casino"
 *   category                         slugified genre (matches category cards)
 *   minScore                         minimum average rating, 0–5
 *   minReviews                       minimum written-review count
 *   sort                             score | rating | trust | reviews | updated | name
 *   order                            asc | desc
 *
 * Response: { data: CasinoApp[], pagination: { page, limit, total, totalPages } }
 */
import type { CasinoApp } from "@/types";
import type { ApiListResponse } from "@/types/api";
import { NextResponse } from "next/server";
import { findApps } from "@/lib/mongo-service";
import { jsonError, paginationMeta, parseAppFilters } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const { items, total, page, limit } = await findApps(
      parseAppFilters(searchParams),
    );
    const body: ApiListResponse<CasinoApp> = {
      data: items,
      pagination: paginationMeta(total, page, limit),
    };
    return NextResponse.json(body);
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Failed to load apps",
    );
  }
}
