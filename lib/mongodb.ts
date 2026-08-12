/**
 * MongoDB connection helper.
 *
 * A SINGLE `MongoClient` is created per Node process and reused across every
 * request. In development we cache the connection promise on `globalThis` so
 * Next.js Fast Refresh / HMR does not open a new pool on every reload.
 *
 * This module is server-only: importing `server-only` makes the build fail loudly
 * if it is ever pulled into a Client Component, guaranteeing the connection
 * string never ships to the browser.
 */
import "server-only";
import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME ?? "google_play_monitor";

/** Physical collection names in the `google_play_monitor` database. */
export const COLLECTIONS = {
  apps: "apps",
  snapshots: "app_snapshots",
  reviews: "reviews",
  monitored: "monitored_apps",
} as const;

declare global {
  // eslint-disable-next-line no-var
  var __acevaultMongo: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | undefined;

function connect(): Promise<MongoClient> {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local, or set NEXT_PUBLIC_DATA_PROVIDER=json to use local mock data.",
    );
  }
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    retryWrites: true,
  });
  return client.connect();
}

function getClientPromise(): Promise<MongoClient> {
  // Reuse across HMR in development.
  if (process.env.NODE_ENV !== "production") {
    if (!global.__acevaultMongo) global.__acevaultMongo = connect();
    return global.__acevaultMongo;
  }
  if (!clientPromise) clientPromise = connect();
  return clientPromise;
}

let indexesEnsured = false;

/**
 * Best-effort index creation. Runs once per process and swallows errors so a
 * read-only database user (or an already-indexed collection) never breaks a
 * request. `createIndex` is idempotent, so re-running is safe.
 */
async function ensureIndexes(db: Db): Promise<void> {
  if (indexesEnsured) return;
  indexesEnsured = true;
  try {
    await Promise.all([
      db.collection(COLLECTIONS.apps).createIndex({ packageName: 1 }, { unique: true }),
      db.collection(COLLECTIONS.apps).createIndex({ score: -1 }),
      db.collection(COLLECTIONS.apps).createIndex({ genre: 1 }),
      db.collection(COLLECTIONS.snapshots).createIndex({ packageName: 1, scrapedAt: -1 }),
      db.collection(COLLECTIONS.reviews).createIndex({ packageName: 1, reviewId: 1 }, { unique: true }),
      db.collection(COLLECTIONS.reviews).createIndex({ packageName: 1, at: -1 }),
      db.collection(COLLECTIONS.monitored).createIndex({ packageName: 1 }, { unique: true }),
    ]);
  } catch {
    // Indexes may already exist or the user may lack privileges — ignore.
  }
}

/** Returns the shared, connected database handle. */
export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  const db = client.db(dbName);
  void ensureIndexes(db); // fire-and-forget; never blocks the request
  return db;
}
