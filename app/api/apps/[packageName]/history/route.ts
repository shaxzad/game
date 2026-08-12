/**
 * GET /api/apps/[packageName]/history
 *
 * Historical metric snapshots for an app (rating, reviews, ratings, installs)
 * ordered oldest → newest, ready to feed a trend chart. Not yet rendered by the
 * UI — provided for a future "Rating history" section.
 *
 * Query params: limit (number of snapshots, most-recent window)
 * Response: { data: HistoryPointDTO[] }
 */
import type { HistoryPointDTO } from "@/types/api";
import { NextResponse } from "next/server";
import { findAppHistory } from "@/lib/mongo-service";
import { intParam, jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ packageName: string }> },
): Promise<Response> {
  try {
    const { packageName } = await params;
    const { searchParams } = new URL(request.url);
    const limit = intParam(searchParams, "limit") ?? 90;
    const data: HistoryPointDTO[] = await findAppHistory(decodeURIComponent(packageName), limit);
    return NextResponse.json({ data });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed to load history");
  }
}
