/**
 * Data provider factory.
 *
 * One place decides which adapter backs the whole site. Switch providers with
 * a single env var — nothing else in the codebase changes.
 *
 *   NEXT_PUBLIC_DATA_PROVIDER=json    → local mock data (default)
 *   NEXT_PUBLIC_DATA_PROVIDER=strapi  → Strapi CMS
 */
import type { AppRepository } from "@/types";
import { jsonAdapter } from "./json-adapter";
import { strapiAdapter } from "./strapi-adapter";

export type DataProvider = "json" | "strapi";

const provider = (process.env.NEXT_PUBLIC_DATA_PROVIDER ?? "json") as DataProvider;

const adapters: Record<DataProvider, AppRepository> = {
  json: jsonAdapter,
  strapi: strapiAdapter,
};

/** The active repository for this deployment. */
export const repository: AppRepository = adapters[provider] ?? jsonAdapter;

export const activeProvider: DataProvider = adapters[provider] ? provider : "json";
