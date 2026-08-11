import type { MetadataRoute } from "next";
import { getAppSlugs, getGuides, getNews, getCategories } from "@/lib/api";
import { siteConfig } from "@/data/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  const [appSlugs, guides, news, categories] = await Promise.all([
    getAppSlugs(),
    getGuides(),
    getNews(),
    getCategories(),
  ]);

  const staticRoutes = [
    "",
    "/apps",
    "/reviews",
    "/compare",
    "/guides",
    "/news",
    "/categories",
    "/search",
    "/about",
    "/contact",
    "/responsible-gambling",
    "/privacy",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const reviewRoutes = appSlugs.map((slug) => ({
    url: `${base}/reviews/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${base}/apps?category=${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const guideRoutes = guides.map((g) => ({
    url: `${base}/guides/${g.slug}`,
    lastModified: new Date(g.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const newsRoutes = news.map((n) => ({
    url: `${base}/news/${n.slug}`,
    lastModified: new Date(n.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...reviewRoutes,
    ...categoryRoutes,
    ...guideRoutes,
    ...newsRoutes,
  ];
}
