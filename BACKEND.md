# AceVault — MongoDB Backend Integration

This document describes the API/data layer that connects the existing AceVault
frontend to **MongoDB Atlas** (database `google_play_monitor`). The UI was not
redesigned — MongoDB simply became the source of truth behind the same data
boundary the frontend already used (`lib/api.ts`).

---

## 1. How the data flows (architecture)

```
Server Components / pages
        │  (unchanged — still import only lib/api.ts)
        ▼
   lib/api.ts  ──►  lib/data/index.ts (provider factory)
                          │
        ┌─────────────────┼───────────────────┐
        ▼                 ▼                     ▼
  mongo-adapter      json-adapter         strapi-adapter
        │
        ▼
  lib/mongo-service.ts  ──►  lib/mongodb.ts (cached client)  ──►  MongoDB Atlas
        │
        ▼
  lib/mappers.ts   (AppDoc → CasinoApp, ReviewDoc → ReviewDTO, …)

REST API (app/api/*)  ──►  lib/mongo-service.ts   (same data layer)
```

The frontend only ever imports `lib/api.ts`. Switching the provider to `mongo`
makes every existing page render real MongoDB data with **zero UI changes**.

---

## 2. Files created / modified

### Created
- `lib/mongodb.ts` — cached `MongoClient` (one pool per process; reused across
  HMR in dev). Server-only. Best-effort index creation.
- `lib/mappers.ts` — translates raw Mongo documents to the UI domain models.
- `lib/mongo-service.ts` — all queries (filter/sort/paginate/project) in one place.
- `lib/http.ts` — query-string parsing + JSON error helper for the routes.
- `lib/data/mongo-adapter.ts` — implements `AppRepository` over MongoDB.
- `types/mongo.ts` — `AppDoc`, `AppSnapshotDoc`, `ReviewDoc`, `MonitoredAppDoc`.
- `types/api.ts` — pagination, list envelope, filters, `ReviewDTO`, `HistoryPointDTO`.
- `app/api/apps/route.ts`
- `app/api/apps/[packageName]/route.ts`
- `app/api/apps/[packageName]/reviews/route.ts`
- `app/api/apps/[packageName]/history/route.ts`
- `app/api/categories/route.ts`
- `app/api/search/route.ts`

### Modified
- `lib/data/index.ts` — added the `mongo` provider + auto-selection.
- `package.json` — added `mongodb` and `server-only`.
- `next.config.mjs` — `serverExternalPackages: ["mongodb"]`.
- `.env.example` — documented `MONGODB_URI`, `DB_NAME`, provider switch.

No page or component files were changed.

---

## 3. API endpoints

All responses are JSON. List endpoints use the envelope
`{ data: [...], pagination: { page, limit, total, totalPages } }`.

| Method & path | Purpose | Key query params |
|---|---|---|
| `GET /api/apps` | Paginated app list | `page, limit, search\|q, genre, category, minScore, minReviews, sort, order` |
| `GET /api/apps/[packageName]` | One app (full) | — |
| `GET /api/apps/[packageName]/reviews` | User reviews | `page, limit, minScore, order` |
| `GET /api/apps/[packageName]/history` | Metric snapshots | `limit` |
| `GET /api/categories` | Genres + counts | — |
| `GET /api/search` | App search | `q\|search, page, limit, sort, order` |

`sort` ∈ `score | rating | trust | reviews | updated | name`; `order` ∈ `asc | desc`.
Limits are capped server-side (`MAX_LIMIT = 100`).

> The `reviews` and `history` endpoints expose data the current UI does not yet
> render. They are ready for a future "Player reviews" / "Rating history"
> section with no further backend work.

---

## 4. MongoDB queries used

- **List** (`apps`): `find(filter, { projection, sort, skip, limit })` +
  `countDocuments(filter)`. Filter supports genre/category, `score >= minScore`,
  `reviews|ratings >= minReviews`, and a case-insensitive `$or` regex search
  across `title, developer, packageName, genre, summary, discovery.queries`.
  Heavy fields (`raw, description, screenshots, histogram, recentChanges`) are
  projected out of list reads.
- **Detail** (`apps`): `findOne({ packageName }, { projection: { raw: 0 } })`.
- **Slugs** (`apps`): `find({}, { projection: { packageName: 1, _id: 0 }, sort, limit })`.
- **Related** (`apps`): same-genre `find` excluding the current `packageName`.
- **Categories** (`apps`): aggregation `$match → $group by genre → $sum → $sort`.
- **Reviews** (`reviews`): `find({ packageName[, score>=] }, { sort:{at:-1}, skip, limit })` + count.
- **History** (`app_snapshots`): `find({ packageName }, { sort:{ scrapedAt:-1 }, limit })`, returned oldest→newest.

### Indexes (created best-effort on first connection, idempotent)
- `apps`: `{ packageName: 1 }` unique, `{ score: -1 }`, `{ genre: 1 }`
- `app_snapshots`: `{ packageName: 1, scrapedAt: -1 }`
- `reviews`: `{ packageName: 1, reviewId: 1 }` unique, `{ packageName: 1, at: -1 }`
- `monitored_apps`: `{ packageName: 1 }` unique

---

## 5. Frontend mock-data sources replaced

With `provider = mongo`, these now resolve from MongoDB instead of `/data`:
- `data/apps.ts` → `apps` collection (via `getApps`, `getAppBySlug`,
  `getAppSlugs`, `getRelatedApps`).
- `data/categories.ts` → derived from distinct `genre` values.

Still sourced from local `/data` (editorial content the scraper does not
produce): `data/guides.ts`, `data/news.ts`, and `data/site.ts` (site config).
These are intentionally left on the local adapter and are trivial to move to a
CMS later.

---

## 6. Environment variables

```
NEXT_PUBLIC_DATA_PROVIDER=mongo          # or json / strapi (optional; auto-detected)
MONGODB_URI="mongodb+srv://…"            # server-only, never NEXT_PUBLIC_
DB_NAME=google_play_monitor
```

---

## 7. Running locally

```bash
npm install          # pulls in mongodb + server-only
# ensure .env.local has MONGODB_URI and DB_NAME
npm run typecheck    # tsc --noEmit
npm run dev          # http://localhost:3000
# quick API check:
curl "http://localhost:3000/api/apps?limit=5&sort=score&order=desc"
```

Build (`npm run build`) prerenders pages using live data, so `MONGODB_URI`
should be set at build time. If it is absent, the app safely falls back to the
local JSON mock data.

---

## 8. Assumptions & remaining TODOs

- **Domain mapping.** Google Play listings do not carry casino-specific fields
  (licenses, payment methods, supported countries, deposit limits, wagering).
  These map to safe empty/neutral defaults; a few sections (pros/cons, features,
  FAQs, the "bonus" slot) are *derived from real metrics* so they stay useful.
  Editorial enrichment (or the `affiliate` sub-document) can override these.
- **`slug` = `packageName`.** The URL, the API path segment and the Mongo key
  are the same value, so no reverse lookup is needed.
- **List working set.** Pages that fetch "all apps" now receive up to
  `DEFAULT_LIMIT (60)` documents to avoid shipping large payloads to the client.
  For very large datasets, wire the client explorer/search to `GET /api/apps`
  with real server-side pagination.
- **Schema tolerance.** The `AppDoc`/`ReviewDoc` types treat every non-key field
  as optional and the mappers degrade gracefully, so field-name variations in
  the scraper output will not crash a page — but confirm field names
  (`score`, `reviews`, `ratings`, `installs`/`minInstalls`, `genre`, `updated`,
  review `at`/`text`) match your scraper if any section looks empty.
- **Not yet in the UI:** individual reviews and rating history (endpoints exist).
