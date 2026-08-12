/**
 * GET /api/apps/[packageName]/reviews
 *
 * Paginated individual user reviews for an app, newest first. This data is not
 * yet rendered by the UI — the endpoint is provided so a "Player reviews"
 * section can be added without further backend work.
 *
 * Query params: page, limit, minScore (1–5), order (asc|desc)
 * Response: { data: ReviewDTO[], pagination: {...} }
 */
import type { ApiListResponse, ReviewDTO } from "@/types/api";
import { NextResponse } from "next/server";
import { findReviews } from "@/lib/mongo-service";
import { floatParam, intParam, jsonError, paginationMeta, parseOrder } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ packageName: string }> },
): Promise<Response> {
  try {
    const { packageName } = await params;
    const { searchParams } = new URL(request.url);
    const { items, total, page, limit } = await findReviews(decodeURIComponent(packageName), {
      page: intParam(searchParams, "page"),
      limit: intParam(searchParams, "limit"),
      minScore: floatParam(searchParams, "minScore"),
      order: parseOrder(searchParams),
    });
    const body: ApiListResponse<ReviewDTO> = {
      data: items,
      pagination: paginationMeta(total, page, limit),
    };
    return NextResponse.json(body);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed to load reviews");
  }
}
