/**
 * JSON adapter — the default data source.
 *
 * Reads the local mock dataset in `/data` and resolves it to the shared
 * domain models. Every method is async so that the interface is identical to
 * a network-backed source (Strapi); pages that `await` these calls will not
 * change one character when the provider switches.
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
import { apps } from "@/data/apps";
import { categories } from "@/data/categories";
import { guides } from "@/data/guides";
import { news } from "@/data/news";
import { sortApps } from "@/utils/sort";

/** Simulate async I/O so behaviour matches a real API during development. */
function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function matchesQuery(app: CasinoApp, query: AppQuery): boolean {
  if (query.category && !app.categories.some((c) => c.slug === query.category)) {
    return false;
  }
  if (query.platform && !app.platforms.includes(query.platform)) return false;
  if (query.payment && !app.payments.includes(query.payment)) return false;
  if (typeof query.minTrust === "number" && app.trustScore < query.minTrust) {
    return false;
  }
  if (query.search) {
    const q = query.search.toLowerCase();
    const haystack = [
      app.name,
      app.tagline,
      app.operator,
      ...app.categories.map((c) => c.name),
      ...app.features,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

export const jsonAdapter: AppRepository = {
  async getApps(query = {}) {
    let result = apps.filter((app) => matchesQuery(app, query));
    result = sortApps(result, query.sort);
    if (query.limit) result = result.slice(0, query.limit);
    return resolve(result);
  },

  async getAppsPage(query = {}): Promise<Paginated<CasinoApp>> {
    const filtered = sortApps(
      apps.filter((app) => matchesQuery(app, query)),
      query.sort,
    );
    const total = filtered.length;
    const page = Math.max(1, Math.floor(query.page ?? 1));
    const limit = query.limit ?? total;
    const start = (page - 1) * limit;
    return resolve({ items: filtered.slice(start, start + limit), total });
  },

  async getAppsCount(query = {}) {
    return resolve(apps.filter((app) => matchesQuery(app, query)).length);
  },

  async getAppBySlug(slug: Slug) {
    return resolve(apps.find((a) => a.slug === slug) ?? null);
  },

  async getAppSlugs() {
    return resolve(apps.map((a) => a.slug));
  },

  async getRelatedApps(slug: Slug, limit = 3) {
    const target = apps.find((a) => a.slug === slug);
    if (!target) return resolve([]);
    const targetCats = new Set(target.categories.map((c) => c.slug));
    const scored = apps
      .filter((a) => a.slug !== slug)
      .map((a) => ({
        app: a,
        score:
          a.categories.filter((c) => targetCats.has(c.slug)).length * 10 +
          (5 - Math.abs(a.trustScore - target.trustScore) / 20),
      }))
      .sort((x, y) => y.score - x.score)
      .slice(0, limit)
      .map((s) => s.app);
    return resolve(scored);
  },

  async getCategories() {
    return resolve(categories);
  },

  async getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
    const counts = new Map<string, number>();
    for (const app of apps) {
      for (const c of app.categories) {
        counts.set(c.slug, (counts.get(c.slug) ?? 0) + 1);
      }
    }
    return resolve(categories.map((c) => ({ ...c, count: counts.get(c.slug) ?? 0 })));
  },

  async getCategoryBySlug(slug: Slug) {
    return resolve(categories.find((c) => c.slug === slug) ?? null);
  },

  async getGuides(limit) {
    const sorted = [...guides].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
    return resolve(limit ? sorted.slice(0, limit) : sorted);
  },

  async getGuideBySlug(slug: Slug) {
    return resolve(guides.find((g) => g.slug === slug) ?? null);
  },

  async getNews(limit) {
    const sorted = [...news].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
    return resolve(limit ? sorted.slice(0, limit) : sorted);
  },

  async getNewsBySlug(slug: Slug) {
    return resolve(news.find((n) => n.slug === slug) ?? null);
  },
};
