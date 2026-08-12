/**
 * MongoDB document shapes for the `google_play_monitor` database.
 *
 * These describe what the scraper WRITES — they are the raw persistence layer,
 * deliberately kept separate from the UI-facing domain models in `types/index.ts`.
 * The mappers in `lib/mappers.ts` translate these documents into `CasinoApp`,
 * `Category`, review and history DTOs so the frontend never sees a raw document.
 *
 * Every field except the identity keys (`packageName`, `reviewId`) is optional:
 * we do not own the scraper schema and must degrade gracefully if a field is
 * missing on a given document.
 */
import type { ObjectId } from "mongodb";

/** Dates may arrive as a BSON Date, an ISO string, or an epoch (ms) number. */
export type DateLike = Date | string | number;

export interface AffiliateInfo {
  enabled?: boolean;
  network?: string;
  affiliateUrl?: string;
  clicks?: number;
}

export interface DiscoveryInfo {
  /** Search queries that surfaced this app in the scraper. */
  queries?: string[];
  firstSeenAt?: DateLike;
  source?: string;
}

/** Collection: `apps` — one document per unique `packageName` (the master record). */
export interface AppDoc {
  _id?: ObjectId;
  packageName: string;

  // Store listing
  title?: string;
  summary?: string;
  description?: string;
  developer?: string;
  developerId?: string;
  developerWebsite?: string;
  developerEmail?: string;
  genre?: string;
  genreId?: string;
  icon?: string;
  headerImage?: string;
  screenshots?: string[];
  video?: string;

  // Ratings & popularity
  score?: number; // average rating, 0–5
  scoreText?: string;
  ratings?: number; // number of star ratings
  reviews?: number; // number of written reviews
  histogram?: Record<string, number> | number[];
  installs?: string; // formatted, e.g. "1,000,000+"
  minInstalls?: number;
  maxInstalls?: number;

  // Commercials
  price?: number;
  free?: boolean;
  currency?: string;
  offersIAP?: boolean;
  IAPRange?: string;

  // Technical / compliance
  androidVersion?: string;
  androidVersionText?: string;
  contentRating?: string;
  released?: string; // e.g. "Jan 1, 2019"
  updated?: DateLike; // gplay: epoch ms
  version?: string;
  recentChanges?: string;
  url?: string; // Play Store listing URL
  privacyPolicy?: string;

  // Scraper-added metadata
  scrapedAt?: DateLike;
  createdAt?: DateLike;
  updatedAt?: DateLike;
  discovery?: DiscoveryInfo;
  affiliate?: AffiliateInfo;

  // `raw` (the untouched scraper payload) is intentionally NOT modelled and is
  // always projected OUT of reads — it must never reach the client.
}

/** Collection: `app_snapshots` — historical point-in-time metrics per app. */
export interface AppSnapshotDoc {
  _id?: ObjectId;
  packageName: string;
  scrapedAt?: DateLike;
  score?: number;
  ratings?: number;
  reviews?: number;
  installs?: string;
  minInstalls?: number;
  version?: string;
}

/** Collection: `reviews` — individual user reviews (unique on packageName+reviewId). */
export interface ReviewDoc {
  _id?: ObjectId;
  packageName: string;
  reviewId: string;
  userName?: string;
  userImage?: string;
  score?: number; // 1–5
  title?: string;
  text?: string;
  content?: string; // some scrapers use `content` instead of `text`
  thumbsUp?: number;
  thumbsUpCount?: number;
  at?: DateLike;
  date?: DateLike;
  publishedAt?: DateLike;
  replyContent?: string | null;
  repliedAt?: DateLike | null;
  version?: string;
  appVersion?: string;
}

/** Collection: `monitored_apps` — scraper sync configuration. */
export interface MonitoredAppDoc {
  _id?: ObjectId;
  packageName: string;
  enabled?: boolean;
  queries?: string[];
  addedAt?: DateLike;
  lastScrapedAt?: DateLike;
  priority?: number;
}
