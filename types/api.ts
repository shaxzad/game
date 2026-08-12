/**
 * HTTP API contract types for the Route Handlers under `app/api`.
 *
 * The REST layer returns the same UI-facing domain models used everywhere else
 * (`CasinoApp`, `Category`) plus a couple of lightweight DTOs for data the
 * frontend does not yet render (individual reviews, rating history). Keeping the
 * response envelope in one place means clients can rely on a stable shape.
 */
import type { AppSortKey, Category } from "@/types";

/** Standard pagination envelope: `{ data, pagination }`. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiListResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiItemResponse<T> {
  data: T;
}

export interface ApiErrorBody {
  error: string;
}

/** Normalised filters accepted by `/api/apps` and the search endpoint. */
export interface AppFilters {
  search?: string;
  /** Match by raw Google-Play genre, e.g. "Casino". */
  genre?: string;
  /** Match by slugified genre (the same slug the UI category cards use). */
  category?: string;
  /** Minimum average score, 0–5. */
  minScore?: number;
  /** Minimum number of written reviews. */
  minReviews?: number;
  sort?: AppSortField;
  order?: SortOrder;
  page?: number;
  limit?: number;
}

/** Sort fields the Mongo service understands (superset of the UI's AppSortKey). */
export type AppSortField = "score" | "rating" | "trust" | "reviews" | "updated" | "name";
export type SortOrder = "asc" | "desc";

/** Maps the UI's domain sort keys onto Mongo sort fields. */
export const SORT_KEY_TO_FIELD: Record<AppSortKey, AppSortField> = {
  trust: "score",
  rating: "score",
  newest: "updated",
  name: "name",
  bonus: "score", // no bonus data from Play — fall back to score
  payout: "score", // no payout data from Play — fall back to score
};

/** A single user review, trimmed to what a client would render. */
export interface ReviewDTO {
  id: string;
  author: string;
  score: number;
  title?: string;
  text: string;
  thumbsUp: number;
  publishedAt: string; // ISO
  appVersion?: string;
  reply?: { text: string; repliedAt?: string } | null;
}

/** A point on an app's historical metrics timeline. */
export interface HistoryPointDTO {
  date: string; // ISO (scrapedAt)
  score: number;
  reviews: number;
  ratings: number;
  installs: number;
}

/** Category with the number of apps that resolve to it (for the categories API). */
export interface CategoryWithCount extends Category {
  count: number;
}
