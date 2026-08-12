/**
 * AceVault domain models.
 *
 * These types are the contract the entire UI is built against. They are
 * intentionally CMS-agnostic: the JSON adapter and the (future) Strapi
 * adapter both resolve to these exact shapes, so pages never change when the
 * data provider switches.
 */

export type Slug = string;

export interface AppCategoryRef {
  slug: Slug;
  name: string;
}

export type LicenseAuthority =
  | "MGA"
  | "UKGC"
  | "Curaçao"
  | "Gibraltar"
  | "Kahnawake"
  | "Isle of Man";

export type PaymentMethod =
  | "Visa"
  | "Mastercard"
  | "PayPal"
  | "Apple Pay"
  | "Google Pay"
  | "Skrill"
  | "Neteller"
  | "Bitcoin"
  | "Ethereum"
  | "Bank Transfer"
  | "Paysafecard"
  | "Trustly";

export type Platform = "iOS" | "Android" | "Web" | "Windows";

export interface RatingBreakdown {
  gameVariety: number; // 0–5
  bonuses: number;
  payoutSpeed: number;
  usability: number;
  support: number;
}

/** One bar of a star-rating distribution (real Google Play histogram). */
export interface RatingHistogramBar {
  stars: number; // 1–5
  count: number; // number of ratings at this star level
}

export interface Bonus {
  headline: string; // e.g. "100% up to $500 + 200 Free Spins"
  type: "Welcome" | "No Deposit" | "Free Spins" | "Cashback" | "Reload";
  wagering: string; // e.g. "35x"
  minDeposit: number;
  code?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Screenshot {
  /** Generated gradient seed so we can render an SVG mock deterministically. */
  seed: string;
  caption: string;
  /**
   * Real image URL (e.g. a Google Play screenshot). When present the gallery
   * renders the actual image; when absent it falls back to the seeded mock.
   */
  url?: string;
}

/** The core reviewable entity. */
export interface CasinoApp {
  id: string;
  slug: Slug;
  name: string;
  tagline: string;
  /** Deterministic gradient seed for the generated logo. */
  logoSeed: string;
  /** Two-letter monogram shown inside the generated logo. */
  monogram: string;
  /** Real logo/icon image URL (e.g. Google Play). Falls back to the monogram tile. */
  logoUrl?: string;
  established: number;
  operator: string;
  /** Developer website (real, from the store listing) if known. */
  developerWebsite?: string;
  license: LicenseAuthority[];
  rating: number; // overall, 0–5, one decimal
  trustScore: number; // 0–100
  ratingBreakdown: RatingBreakdown;
  /** Real 1–5 star distribution when available (Google Play histogram). */
  ratingHistogram?: RatingHistogramBar[];
  reviewsCount: number;
  categories: AppCategoryRef[];
  platforms: Platform[];
  payments: PaymentMethod[];
  supportedCountries: string[]; // ISO 3166-1 alpha-2
  restrictedCountries: string[];
  currencies: string[];
  /** Real store facts (Google Play) when available. */
  installs?: string; // e.g. "1,000,000+"
  contentRating?: string; // e.g. "Adults only 18+"
  version?: string; // e.g. "8.0.76.00-us"
  minDeposit: number;
  payoutTime: string; // e.g. "0–24 hours"
  gamesCount: number;
  bonus: Bonus;
  pros: string[];
  cons: string[];
  features: string[];
  screenshots: Screenshot[];
  faqs: FaqItem[];
  affiliateUrl: string;
  /** Editorial long-form verdict (markdown-free plain paragraphs). */
  verdict: string[];
  editorScore: number; // 0–5
  trending: boolean;
  featured: boolean;
  updatedAt: string; // ISO date
}

export interface Category {
  slug: Slug;
  name: string;
  description: string;
  /** Lucide icon name, resolved in the UI. */
  icon: string;
  accent: string; // token name: "primary" | "gold"
}

export interface Guide {
  slug: Slug;
  title: string;
  excerpt: string;
  category: string;
  readingTime: number; // minutes
  level: "Beginner" | "Intermediate" | "Advanced";
  author: string;
  publishedAt: string; // ISO date
  coverSeed: string;
  body: string[]; // paragraphs
}

export interface NewsArticle {
  slug: Slug;
  title: string;
  excerpt: string;
  category: "Industry" | "Regulation" | "Bonuses" | "Product" | "Responsible Play";
  author: string;
  publishedAt: string; // ISO date
  coverSeed: string;
  body: string[];
}

export interface SiteConfig {
  name: string;
  domain: string;
  url: string;
  description: string;
  tagline: string;
  email: string;
  social: { label: string; href: string; icon: string }[];
  nav: { label: string; href: string }[];
}

/* ── Query params understood by the repository ─────────────────────────── */

export type AppSortKey =
  | "trust"
  | "rating"
  | "newest"
  | "name"
  | "bonus"
  | "payout";

export interface AppQuery {
  search?: string;
  category?: Slug;
  platform?: Platform;
  payment?: PaymentMethod;
  minTrust?: number;
  sort?: AppSortKey;
  /** 1-based page number for paginated reads. */
  page?: number;
  limit?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
}

/** A category with the number of apps currently resolving to it. */
export type CategoryWithCount = Category & { count: number };

/**
 * The single interface every data source implements.
 * `lib/api.ts` is the only thing the UI imports; it delegates to whichever
 * adapter is configured (JSON today, Strapi tomorrow).
 */
export interface AppRepository {
  getApps(query?: AppQuery): Promise<CasinoApp[]>;
  /** Paginated apps + the total matching count (for infinite scroll / "N apps"). */
  getAppsPage(query?: AppQuery): Promise<Paginated<CasinoApp>>;
  /** Total apps matching a query, without fetching the documents. */
  getAppsCount(query?: AppQuery): Promise<number>;
  getAppBySlug(slug: Slug): Promise<CasinoApp | null>;
  getAppSlugs(): Promise<Slug[]>;
  getRelatedApps(slug: Slug, limit?: number): Promise<CasinoApp[]>;
  getCategories(): Promise<Category[]>;
  /** Categories with real per-category app counts. */
  getCategoriesWithCounts(): Promise<CategoryWithCount[]>;
  getCategoryBySlug(slug: Slug): Promise<Category | null>;
  getGuides(limit?: number): Promise<Guide[]>;
  getGuideBySlug(slug: Slug): Promise<Guide | null>;
  getNews(limit?: number): Promise<NewsArticle[]>;
  getNewsBySlug(slug: Slug): Promise<NewsArticle | null>;
}
