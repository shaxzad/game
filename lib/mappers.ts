/**
 * Mappers: raw MongoDB documents → UI-facing domain models.
 *
 * The frontend was built against a rich casino-review model (`CasinoApp`), while
 * MongoDB stores Google-Play listing data keyed by `packageName`. This module is
 * the single place that bridges the two:
 *
 *  - Fields with a real source (name, rating, reviews, developer, genre,
 *    screenshots, description, store URL) are mapped directly.
 *  - Casino-specific fields that Google Play does not provide (licenses, payment
 *    methods, supported countries, deposit limits) resolve to safe empty/neutral
 *    defaults so the existing UI renders without change.
 *  - A few fields (pros/cons, features, FAQs, the "bonus" slot) are DERIVED from
 *    real metrics so those sections stay useful rather than blank.
 *
 * The `slug` is the `packageName` itself, so the URL, the API path segment and
 * the Mongo lookup key are always the same value.
 */
import type {
  Bonus,
  CasinoApp,
  Category,
  FaqItem,
  RatingBreakdown,
  Screenshot,
} from "@/types";
import type {
  AppDoc,
  AppSnapshotDoc,
  DateLike,
  ReviewDoc,
} from "@/types/mongo";
import type {
  CategoryWithCount,
  HistoryPointDTO,
  ReviewDTO,
} from "@/types/api";

/* ── Small, pure helpers ────────────────────────────────────────────────── */

function toIso(value?: DateLike | null, fallbackToNow = true): string {
  if (value == null) return fallbackToNow ? new Date().toISOString() : "";
  if (value instanceof Date) return value.toISOString();
  const d = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(d.getTime())) return fallbackToNow ? new Date().toISOString() : "";
  return d.toISOString();
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function num(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/** Compact human count, e.g. 1_250_000 → "1.3M". */
function compact(n: number): string {
  if (n >= 1_000_000) return `${round1(n / 1_000_000)}M`;
  if (n >= 1_000) return `${round1(n / 1_000)}K`;
  return String(n);
}

/** Two-letter monogram for the generated logo. */
export function monogramFrom(name: string): string {
  const words = name
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "AP";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** URL-safe slug for a Google-Play genre, e.g. "Casino & Card" → "casino-and-card". */
export function slugifyGenre(genre?: string): string {
  const slug = (genre ?? "casino")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "casino";
}

/** Best-available install count as a number (minInstalls or parsed "1,000,000+"). */
function installCount(doc: AppDoc): number {
  if (typeof doc.minInstalls === "number") return doc.minInstalls;
  if (doc.installs) {
    const digits = doc.installs.replace(/[^\d]/g, "");
    if (digits) return Number(digits);
  }
  return 0;
}

/** Formatted installs label, preferring the store's own "1,000,000+" string. */
function installLabel(doc: AppDoc): string {
  if (doc.installs) return doc.installs;
  const c = installCount(doc);
  return c > 0 ? `${compact(c)}+` : "";
}

function paragraphs(text?: string, max = 6): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);
}

function yearFrom(doc: AppDoc): number {
  const fromReleased = doc.released ? new Date(doc.released).getFullYear() : NaN;
  if (!Number.isNaN(fromReleased)) return fromReleased;
  const iso = toIso(doc.updated ?? doc.createdAt, false);
  const y = iso ? new Date(iso).getFullYear() : NaN;
  return Number.isNaN(y) ? new Date().getFullYear() : y;
}

/* ── Derived, data-honest content for casino-only UI sections ────────────── */

function deriveBonus(doc: AppDoc): Bonus {
  const label = installLabel(doc);
  const headline = doc.affiliate?.network
    ? `${doc.affiliate.network} partner offer`
    : label
      ? `${label} installs on Google Play`
      : doc.free === false
        ? `Paid app${doc.currency ? ` · ${doc.currency} ${num(doc.price)}` : ""}`
        : "Free to download";
  return { headline, type: "Welcome", wagering: "N/A", minDeposit: 0 };
}

function deriveFeatures(doc: AppDoc): string[] {
  const out: string[] = [];
  if (doc.genre) out.push(`${doc.genre} on Google Play`);
  if (doc.contentRating) out.push(`Content rating: ${doc.contentRating}`);
  if (doc.androidVersionText) out.push(`Requires Android ${doc.androidVersionText}`);
  if (doc.offersIAP) out.push("Offers in-app purchases");
  if (typeof doc.free === "boolean") out.push(doc.free ? "Free to download" : "Paid download");
  if (doc.version) out.push(`Current version ${doc.version}`);
  if (doc.developer) out.push(`Published by ${doc.developer}`);
  return out.slice(0, 6);
}

function derivePros(doc: AppDoc, score: number, reviews: number): string[] {
  const pros: string[] = [];
  if (score >= 4.3) pros.push(`Highly rated — ${round1(score)}/5 from players`);
  if (reviews >= 10_000) pros.push(`Large, active community (${compact(reviews)} reviews)`);
  if (doc.free) pros.push("Free to download");
  const installs = installCount(doc);
  if (installs >= 1_000_000) pros.push(`Widely installed (${installLabel(doc)})`);
  if (pros.length === 0 && score > 0) pros.push(`Rated ${round1(score)}/5 on Google Play`);
  return pros.slice(0, 5);
}

function deriveCons(doc: AppDoc, score: number): string[] {
  const cons: string[] = [];
  if (score > 0 && score < 3.5) cons.push(`Below-average rating — ${round1(score)}/5`);
  if (doc.offersIAP) cons.push("Contains in-app purchases");
  if (doc.contentRating && /17|18|mature|adult/i.test(doc.contentRating)) {
    cons.push(`Age-restricted (${doc.contentRating})`);
  }
  cons.push("Gamble responsibly — 18+ only");
  return cons.slice(0, 5);
}

function deriveFaqs(doc: AppDoc, name: string, score: number, reviews: number): FaqItem[] {
  const faqs: FaqItem[] = [];
  faqs.push({
    question: `Is ${name} free to download?`,
    answer: doc.free
      ? `Yes — ${name} is free to download on Google Play${doc.offersIAP ? ", though it offers in-app purchases." : "."}`
      : `${name} is a paid app on Google Play${doc.currency ? ` (${doc.currency} ${num(doc.price)}).` : "."}`,
  });
  if (doc.developer) {
    faqs.push({
      question: `Who develops ${name}?`,
      answer: `${name} is developed by ${doc.developer}.`,
    });
  }
  const label = installLabel(doc);
  if (label || reviews > 0) {
    faqs.push({
      question: `How popular is ${name}?`,
      answer: `${name} has ${label || "a growing number of"} installs and ${compact(reviews)} reviews on Google Play, with an average rating of ${round1(score)}/5.`,
    });
  }
  if (doc.contentRating) {
    faqs.push({
      question: `What is the content rating for ${name}?`,
      answer: `${name} carries a "${doc.contentRating}" content rating on Google Play.`,
    });
  }
  return faqs;
}

function deriveScreenshots(doc: AppDoc): Screenshot[] {
  const count = doc.screenshots?.length ? Math.min(doc.screenshots.length, 6) : 4;
  return Array.from({ length: count }, (_, i) => ({
    seed: `${doc.packageName}-shot-${i}`,
    caption: `Screenshot ${i + 1}`,
  }));
}

/* ── Primary mapper ─────────────────────────────────────────────────────── */

/**
 * Convert an `apps` document into the UI's `CasinoApp`.
 *
 * `full` controls whether long-form / heavy fields are populated. List queries
 * project those out, so we skip them there to keep payloads small; the card UI
 * does not read them anyway.
 */
export function appDocToCasinoApp(doc: AppDoc, full = false): CasinoApp {
  const name = doc.title?.trim() || doc.packageName;
  const score = round1(clamp(num(doc.score), 0, 5));
  const reviews = num(doc.reviews ?? doc.ratings);
  const trustScore = Math.round((score / 5) * 100);
  const breakdown: RatingBreakdown = {
    gameVariety: score,
    bonuses: score,
    payoutSpeed: score,
    usability: score,
    support: score,
  };

  const verdict = full
    ? paragraphs(doc.description).length
      ? paragraphs(doc.description)
      : doc.summary
        ? [doc.summary]
        : [`${name} is tracked from its Google Play listing. A full editorial verdict will appear here once reviewed.`]
    : [];

  return {
    id: doc._id ? String(doc._id) : doc.packageName,
    slug: doc.packageName,
    name,
    tagline: doc.summary?.trim() || paragraphs(doc.description, 1)[0] || `${name} on Google Play`,
    logoSeed: doc.packageName,
    monogram: monogramFrom(name),
    established: yearFrom(doc),
    operator: doc.developer?.trim() || "Unknown developer",
    license: [], // not available from Google Play data
    rating: score,
    trustScore,
    ratingBreakdown: breakdown,
    reviewsCount: reviews,
    categories: doc.genre ? [{ slug: slugifyGenre(doc.genre), name: doc.genre }] : [],
    platforms: ["Android"],
    payments: [], // not available from Google Play data
    supportedCountries: [], // not available from Google Play data
    restrictedCountries: [],
    currencies: doc.currency ? [doc.currency] : [],
    minDeposit: 0,
    payoutTime: "N/A",
    gamesCount: 0,
    bonus: deriveBonus(doc),
    pros: full ? derivePros(doc, score, reviews) : [],
    cons: full ? deriveCons(doc, score) : [],
    features: full ? deriveFeatures(doc) : [],
    screenshots: full ? deriveScreenshots(doc) : [],
    faqs: full ? deriveFaqs(doc, name, score, reviews) : [],
    affiliateUrl:
      doc.affiliate?.affiliateUrl ||
      doc.url ||
      `https://play.google.com/store/apps/details?id=${doc.packageName}`,
    verdict,
    editorScore: score,
    // No global ranking inside a per-doc mapper, so derive from real metrics:
    trending: score >= 4.3 && reviews >= 5_000,
    featured: score >= 4.5,
    updatedAt: toIso(doc.updated ?? doc.updatedAt ?? doc.scrapedAt),
  };
}

/* ── Review & history DTO mappers ───────────────────────────────────────── */

export function reviewDocToDTO(doc: ReviewDoc): ReviewDTO {
  return {
    id: doc.reviewId,
    author: doc.userName?.trim() || "Anonymous",
    score: clamp(num(doc.score), 0, 5),
    title: doc.title || undefined,
    text: (doc.text ?? doc.content ?? "").trim(),
    thumbsUp: num(doc.thumbsUp ?? doc.thumbsUpCount),
    publishedAt: toIso(doc.at ?? doc.date ?? doc.publishedAt),
    appVersion: doc.appVersion ?? doc.version ?? undefined,
    reply: doc.replyContent
      ? { text: doc.replyContent, repliedAt: doc.repliedAt ? toIso(doc.repliedAt) : undefined }
      : null,
  };
}

export function snapshotDocToHistoryPoint(doc: AppSnapshotDoc): HistoryPointDTO {
  return {
    date: toIso(doc.scrapedAt),
    score: round1(clamp(num(doc.score), 0, 5)),
    reviews: num(doc.reviews),
    ratings: num(doc.ratings),
    installs: num(doc.minInstalls),
  };
}

/* ── Category derivation ────────────────────────────────────────────────── */

const GENRE_ICONS: Record<string, string> = {
  casino: "Dices",
  card: "Diamond",
  board: "Grid3x3",
  casual: "Gamepad2",
  arcade: "Joystick",
  strategy: "Brain",
  trivia: "HelpCircle",
  puzzle: "Puzzle",
  sports: "Trophy",
  simulation: "Cpu",
  action: "Zap",
  role: "Swords",
};

function iconForGenre(genre: string): string {
  const key = genre.toLowerCase();
  for (const [needle, icon] of Object.entries(GENRE_ICONS)) {
    if (key.includes(needle)) return icon;
  }
  return "Dices";
}

/** Build a `Category` (with app count) from a distinct genre + its tally. */
export function genreToCategory(genre: string, count: number, index: number): CategoryWithCount {
  return {
    slug: slugifyGenre(genre),
    name: genre,
    description: `${genre} apps tracked on Google Play, ranked by rating, review volume and popularity.`,
    icon: iconForGenre(genre),
    accent: index % 2 === 0 ? "primary" : "gold",
    count,
  };
}

/** Strip the count for the `Category`-typed repository interface. */
export function toCategory(c: CategoryWithCount): Category {
  const { count: _count, ...rest } = c;
  void _count;
  return rest;
}
