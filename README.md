# AceVault — Casino & Gambling App Reviews

A production-quality affiliate website for casino and gambling app reviews.
Designed to look and feel like a premium fintech product (think Stripe / Apple
level of polish) — deliberately *not* styled like any existing casino site.

## Stack

- Next.js 15 (App Router, Server Components, streaming)
- TypeScript (strict)
- Tailwind CSS + shadcn/ui-style primitives (Radix UI)
- Dark / light mode via `next-themes`
- SEO: metadata API, JSON-LD (Review + FAQPage), `sitemap.xml`, `robots.txt`

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run lint`, `npm run typecheck`.

## Architecture

```
app/          routes (pages) + layouts
components/   reusable UI: layout/, home/, apps/, compare/, search/, ui/
data/         mock JSON content (apps, categories, guides, news, site)
lib/          utils, SEO helpers, and the data service layer (lib/data/)
hooks/        useReveal, useCountUp, useDebouncedValue, …
types/        shared TypeScript models
utils/        pure helpers (formatting, flags, sorting, …)
```

### Data service layer — swap JSON for Strapi without touching the UI

Every page and component reads data through one async repository interface
(`AppRepository` in `types/`), implemented by:

- `lib/data/json-adapter.ts` — reads the local mock data in `/data`
- `lib/data/strapi-adapter.ts` — same interface, implemented against the
  Strapi REST API (fill in the mapping, then flip the env var)

```bash
# current: local mock JSON
NEXT_PUBLIC_DATA_PROVIDER=json

# later: live CMS, zero UI changes
NEXT_PUBLIC_DATA_PROVIDER=strapi
STRAPI_API_URL=…   STRAPI_API_TOKEN=…
```

UI components never import `/data` directly — only `lib/api.ts` (typed async
functions such as `getApps()`, `getAppBySlug()`), so pages stay identical when
the provider switches.

### Notes

- All logos, screenshots and visuals are generated (CSS/SVG), so the site is
  fully offline and needs no image service. Swap `logo` fields in `/data` for
  real asset URLs when the CMS lands.
- Affiliate links point at mock destinations (`https://go.acevault.test/…`).
- This is a demo/mock dataset. Brands, ratings and offers are fictional.
- 18+. Please gamble responsibly. See `/responsible-gambling`.

## Folder conventions

- Server Components for data pages; `"use client"` only where interactivity
  requires it (search, compare, theme toggle, forms).
- All data access is async — pages can stream with loading skeletons.
- Every content type (app, category, guide, news) has a slug and its own
  route, ready to be driven by Strapi later.
