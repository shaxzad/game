/**
 * Public data API — the ONLY module the UI imports for content.
 *
 * Pages and components call these typed async functions and never touch the
 * adapters or the `/data` files directly. That indirection is what lets us
 * swap JSON for Strapi (or any future source) without changing the UI.
 */
import { repository } from "@/lib/data";
import type {
  AppQuery,
  CasinoApp,
  Category,
  CategoryWithCount,
  Guide,
  NewsArticle,
  Paginated,
  Slug,
} from "@/types";

export const getApps = (query?: AppQuery): Promise<CasinoApp[]> =>
  repository.getApps(query);

/** Paginated apps + total matching count (infinite scroll, "N apps"). */
export const getAppsPage = (query?: AppQuery): Promise<Paginated<CasinoApp>> =>
  repository.getAppsPage(query);

/** Total apps matching a query, without fetching the documents. */
export const getAppsCount = (query?: AppQuery): Promise<number> =>
  repository.getAppsCount(query);

export const getAppBySlug = (slug: Slug): Promise<CasinoApp | null> =>
  repository.getAppBySlug(slug);

export const getAppSlugs = (): Promise<Slug[]> => repository.getAppSlugs();

export const getRelatedApps = (slug: Slug, limit?: number): Promise<CasinoApp[]> =>
  repository.getRelatedApps(slug, limit);

export const getCategories = (): Promise<Category[]> => repository.getCategories();

/** Categories with real per-category app counts. */
export const getCategoriesWithCounts = (): Promise<CategoryWithCount[]> =>
  repository.getCategoriesWithCounts();

export const getCategoryBySlug = (slug: Slug): Promise<Category | null> =>
  repository.getCategoryBySlug(slug);

export const getGuides = (limit?: number): Promise<Guide[]> =>
  repository.getGuides(limit);

export const getGuideBySlug = (slug: Slug): Promise<Guide | null> =>
  repository.getGuideBySlug(slug);

export const getNews = (limit?: number): Promise<NewsArticle[]> =>
  repository.getNews(limit);

export const getNewsBySlug = (slug: Slug): Promise<NewsArticle | null> =>
  repository.getNewsBySlug(slug);

/** Convenience aggregations used by the homepage. */
export async function getHomepageData() {
  const [trending, topRated, featured, latestNews, latestGuides, categories, appCount] =
    await Promise.all([
      getApps({ sort: "rating", limit: 8 }).then((a) => a.filter((x) => x.trending).slice(0, 6)),
      getApps({ sort: "trust", limit: 6 }),
      getApps({ limit: 24 }).then((a) => a.filter((x) => x.featured).slice(0, 3)),
      getNews(4),
      getGuides(3),
      getCategoriesWithCounts(),
      getAppsCount(),
    ]);
  return { trending, topRated, featured, latestNews, latestGuides, categories, appCount };
}
