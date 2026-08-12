import type { CasinoApp } from "@/types";
import { screenshotsFor } from "./screenshots";

/**
 * Mock dataset — 20 fictional casino/gambling apps.
 * Brands, ratings, bonuses and operators are invented for demonstration.
 * When the Strapi adapter goes live this array is replaced by CMS responses
 * mapped to the same `CasinoApp` shape.
 */
export const apps: CasinoApp[] = [];
