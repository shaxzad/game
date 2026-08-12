/**
 * GET /api/categories
 *
 * Distinct Google-Play genres as category cards, each with its app count.
 * Response: { data: CategoryWithCount[] }
 */
import type { CategoryWithCount } from "@/types/api";
import { NextResponse } from "next/server";
import { deriveCategories } from "@/lib/mongo-service";
import { jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const data: CategoryWithCount[] = await deriveCategories();
    return NextResponse.json({ data });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed to load categories");
  }
}
