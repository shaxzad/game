import type { Metadata } from "next";
import type { CasinoApp, Guide, NewsArticle } from "@/types";
import { siteConfig } from "@/data/site";

/** Build a canonical absolute URL from a path. */
export function absoluteUrl(path = "/"): string {
  const base = siteConfig.url.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

interface PageMetaInput {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  type?: "website" | "article";
}

/** Compose consistent, SEO-complete metadata for any route. */
export function pageMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  keywords = [],
  type = "website",
}: PageMetaInput = {}): Metadata {
  const fullTitle = title ? `${title} · ${siteConfig.name}` : `${siteConfig.name} — ${siteConfig.tagline}`;
  const url = absoluteUrl(path);
  return {
    title: title ?? undefined,
    description,
    keywords: [
      "casino app reviews",
      "online casino",
      "gambling apps",
      "casino bonuses",
      ...keywords,
    ],
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      type,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

/* ── JSON-LD structured data builders ──────────────────────────────────── */

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function appReviewLd(app: CasinoApp) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "SoftwareApplication",
      name: app.name,
      applicationCategory: "GameApplication",
      operatingSystem: app.platforms.join(", "),
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: app.rating,
      bestRating: 5,
      worstRating: 1,
    },
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
    datePublished: app.updatedAt,
  };
}

export function aggregateRatingLd(app: CasinoApp) {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    ratingValue: app.rating,
    reviewCount: app.reviewsCount,
    bestRating: 5,
  };
}

export function faqLd(app: CasinoApp) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: app.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function breadcrumbLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

export function articleLd(article: Guide | NewsArticle, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    author: { "@type": "Person", name: article.author },
    publisher: { "@type": "Organization", name: siteConfig.name },
    datePublished: article.publishedAt,
    url: absoluteUrl(path),
  };
}
