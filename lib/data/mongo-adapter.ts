/**
 * MongoDB adapter — resolves the shared `AppRepository` interface against the
 * `google_play_monitor` database. Selected by the factory when
 * NEXT_PUBLIC_DATA_PROVIDER=mongo (or automatically when MONGODB_URI is set).
 *
 * App, category and search data come from MongoDB. Guides and news are
 * EDITORIAL content the scraper does not produce, so they continue to resolve
 * from the local `/data` files — a deliberate, documented hybrid. When those
 * move to a CMS, only the four methods at the bottom change.
 *
 * Because it implements the same interface as the JSON adapter, no page or
 * component changes: the UI only ever imports `lib/api.ts`.
 */
import type {
  AppQuery,
  AppRepository,
  CasinoApp,
  Category,
  Guide,
  NewsArticle,
  Slug,
} from "@/types";
import { SORT_KEY_TO_FIELD, type AppSortField } from "@/types/api";
import { guides } from "@/data/guides";
import { news } from "@/data/news";
import { sortApps } from "@/utils/sort";
import { toCategory } from "@/lib/mappers";
import {
  DEFAULT_LIMIT,
  deriveCategories,
  findAppByPackageName,
  findApps,
  findCategoryBySlug,
  findRelatedApps,
  listAppPackageNames,
} from "@/lib/mongo-service";

export const mongoAdapter: AppRepository = {
  async getApps(query: AppQuery = {}): Promise<CasinoApp[]> {
    const field: AppSortField = query.sort ? SORT_KEY_TO_FIELD[query.sort] : "score";
    const { items } = await findApps({
      search: query.search,
      category: query.category,
      // UI trust score is 0–100; the DB `score` is 0–5 (trust = score / 5 * 100).
      minScore: typeof query.minTrust === "number" ? query.minTrust / 20 : undefined,
      sort: field,
      order: field === "name" ? "asc" : "desc",
      limit: query.limit ?? DEFAULT_LIMIT,
    });

    // Play data is Android-only with no payment metadata; honour these UI
    // filters client-of-DB side so the semantics match the JSON adapter.
    let result = items;
    if (query.platform) result = result.filter((a) => a.platforms.includes(query.platform!));
    if (query.payment) result = result.filter((a) => a.payments.includes(query.payment!));

    // Re-apply the UI's exact sort semantics over the fetched page.
    return query.sort ? sortApps(result, query.sort) : result;
  },

  async getAppBySlug(slug: Slug): Promise<CasinoApp | null> {
    return findAppByPackageName(slug);
  },

  async getAppSlugs(): Promise<Slug[]> {
    return listAppPackageNames();
  },

  async getRelatedApps(slug: Slug, limit = 3): Promise<CasinoApp[]> {
    return findRelatedApps(slug, limit);
  },

  async getCategories(): Promise<Category[]> {
    const categories = await deriveCategories();
    return categories.map(toCategory);
  },

  async getCategoryBySlug(slug: Slug): Promise<Category | null> {
    const category = await findCategoryBySlug(slug);
    return category ? toCategory(category) : null;
  },

  /* ── Editorial content: sourced from local /data (not scraped) ─────────── */

  async getGuides(limit?: number): Promise<Guide[]> {
    const sorted = [...guides].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
    return limit ? sorted.slice(0, limit) : sorted;
  },

  async getGuideBySlug(slug: Slug): Promise<Guide | null> {
    return guides.find((g) => g.slug === slug) ?? null;
  },

  async getNews(limit?: number): Promise<NewsArticle[]> {
    const sorted = [...news].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
    return limit ? sorted.slice(0, limit) : sorted;
  },

  async getNewsBySlug(slug: Slug): Promise<NewsArticle | null> {
    return news.find((n) => n.slug === slug) ?? null;
  },
};
