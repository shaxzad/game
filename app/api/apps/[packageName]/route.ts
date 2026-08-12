/**
 * GET /api/apps/[packageName]
 *
 * A single app, fully mapped to the `CasinoApp` domain model. `packageName` is
 * the unique key from MongoDB and doubles as the site slug.
 *
 * Response: { data: CasinoApp }  ·  404 { error } when not found.
 */
import type { CasinoApp } from "@/types";
import type { ApiItemResponse } from "@/types/api";
import { NextResponse } from "next/server";
import { findAppByPackageName } from "@/lib/mongo-service";
import { jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ packageName: string }> },
): Promise<Response> {
  try {
    const { packageName } = await params;
    const app = await findAppByPackageName(decodeURIComponent(packageName));
    if (!app) return jsonError("App not found", 404);
    const body: ApiItemResponse<CasinoApp> = { data: app };
    return NextResponse.json(body);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed to load app");
  }
}
