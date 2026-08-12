/**
 * Data provider factory.
 *
 * One place decides which adapter backs the whole site. Switch providers with
 * a single env var — nothing else in the codebase changes.
 *
 *   NEXT_PUBLIC_DATA_PROVIDER=mongo   → MongoDB Atlas (google_play_monitor)
 *   NEXT_PUBLIC_DATA_PROVIDER=json    → local mock data
 *   NEXT_PUBLIC_DATA_PROVIDER=strapi  → Strapi CMS (scaffolded, not wired)
 *
 * If NEXT_PUBLIC_DATA_PROVIDER is unset, we default to `mongo` when a
 * MONGODB_URI is present, otherwise fall back to the local JSON mock data. That
 * means a configured deployment "just works" while a fresh clone without a
 * database still runs.
 */
import type { AppRepository } from "@/types";
import { jsonAdapter } from "./json-adapter";
import { strapiAdapter } from "./strapi-adapter";
import { mongoAdapter } from "./mongo-adapter";

export type DataProvider = "json" | "strapi" | "mongo";

const explicit = process.env.NEXT_PUBLIC_DATA_PROVIDER as DataProvider | undefined;
const provider: DataProvider =
  explicit ?? (process.env.MONGODB_URI ? "mongo" : "json");

const adapters: Record<DataProvider, AppRepository> = {
  json: jsonAdapter,
  strapi: strapiAdapter,
  mongo: mongoAdapter,
};

/** The active repository for this deployment. */
export const repository: AppRepository = adapters[provider] ?? jsonAdapter;

export const activeProvider: DataProvider = adapters[provider] ? provider : "json";
