/**
 * Strapi adapter — the future data source (NOT active yet).
 *
 * This file exists so the migration path is concrete: it implements the exact
 * same `AppRepository` interface as the JSON adapter. When the CMS is ready:
 *
 *   1. Model the content types in Strapi (casino-app, category, guide, news).
 *   2. Fill in the `mapApp` / `mapCategory` / … mappers below so Strapi's
 *      response shape is translated into AceVault's domain models.
 *   3. Set NEXT_PUBLIC_DATA_PROVIDER=strapi (+ STRAPI_API_URL / _TOKEN).
 *
 * No page or component changes are required — they only ever import
 * `lib/api.ts`, which is provider-agnostic.
 */
import type {
  AppQuery,
  AppRepository,
  CasinoApp,
  Category,
  CategoryWithCount,
  Guide,
  NewsArticle,
  Paginated,
  Slug,
} from "@/types";

const API_URL = process.env.STRAPI_API_URL;
const API_TOKEN = process.env.STRAPI_API_TOKEN;

async function strapiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  if (!API_URL) {
    throw new Error(
      "STRAPI_API_URL is not set. Set NEXT_PUBLIC_DATA_PROVIDER=json or configure Strapi.",
    );
  }
  const url = new URL(path.replace(/^\//, ""), API_URL.replace(/\/?$/, "/"));
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {},
    // Cache for an hour; Strapi webhooks can revalidate on publish.
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Strapi request failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

/* ── Mappers: Strapi entity → AceVault domain model ────────────────────── */
/* Implement these against your Strapi schema. Shapes intentionally omitted   */
/* until the content types are finalised.                                     */

// interface StrapiEntity<A> { id: number; attributes: A }
// function mapApp(entity: StrapiEntity<Record<string, unknown>>): CasinoApp { … }
// function mapCategory(entity: StrapiEntity<Record<string, unknown>>): Category { … }
// function mapGuide(entity: StrapiEntity<Record<string, unknown>>): Guide { … }
// function mapNews(entity: StrapiEntity<Record<string, unknown>>): NewsArticle { … }

const NOT_IMPLEMENTED = "Strapi adapter is scaffolded but not yet wired. Implement the mappers in lib/data/strapi-adapter.ts.";

export const strapiAdapter: AppRepository = {
  async getApps(_query?: AppQuery): Promise<CasinoApp[]> {
    // Example once mappers exist:
    // const json = await strapiFetch<{ data: StrapiEntity<any>[] }>("casino-apps", { populate: "*" });
    // return json.data.map(mapApp);
    void strapiFetch; void _query;
    throw new Error(NOT_IMPLEMENTED);
  },
  async getAppsPage(_query?: AppQuery): Promise<Paginated<CasinoApp>> {
    throw new Error(NOT_IMPLEMENTED);
  },
  async getAppsCount(_query?: AppQuery): Promise<number> {
    throw new Error(NOT_IMPLEMENTED);
  },
  async getAppBySlug(_slug: Slug): Promise<CasinoApp | null> {
    throw new Error(NOT_IMPLEMENTED);
  },
  async getAppSlugs(): Promise<Slug[]> {
    throw new Error(NOT_IMPLEMENTED);
  },
  async getRelatedApps(_slug: Slug, _limit?: number): Promise<CasinoApp[]> {
    throw new Error(NOT_IMPLEMENTED);
  },
  async getCategories(): Promise<Category[]> {
    throw new Error(NOT_IMPLEMENTED);
  },
  async getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
    throw new Error(NOT_IMPLEMENTED);
  },
  async getCategoryBySlug(_slug: Slug): Promise<Category | null> {
    throw new Error(NOT_IMPLEMENTED);
  },
  async getGuides(_limit?: number): Promise<Guide[]> {
    throw new Error(NOT_IMPLEMENTED);
  },
  async getGuideBySlug(_slug: Slug): Promise<Guide | null> {
    throw new Error(NOT_IMPLEMENTED);
  },
  async getNews(_limit?: number): Promise<NewsArticle[]> {
    throw new Error(NOT_IMPLEMENTED);
  },
  async getNewsBySlug(_slug: Slug): Promise<NewsArticle | null> {
    throw new Error(NOT_IMPLEMENTED);
  },
};
