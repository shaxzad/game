#!/usr/bin/env node
/**
 * AceVault — API smoke test
 * ---------------------------------------------------------------------------
 * Exercises every REST endpoint under `app/api/*` against a RUNNING server and
 * asserts two things:
 *
 *   1. Contract   — status codes, the `{ data, pagination }` envelope, and the
 *                   field types clients rely on.
 *   2. Real data  — that the fields the UI now renders from MongoDB are
 *                   actually populated: app logos (`logoUrl`), real screenshot
 *                   URLs, the 1–5★ rating histogram, and Google-Play metadata
 *                   (installs / content rating / version).
 *
 * It talks ONLY over HTTP, so it never reads MONGODB_URI or any secret — the
 * database stays entirely server-side. Point it at a dev or preview server.
 *
 * Usage:
 *   1. In one terminal:   npm run dev
 *   2. In another:        node scripts/smoke-test-api.mjs
 *                         node scripts/smoke-test-api.mjs http://localhost:3000
 *                         BASE_URL=https://staging.example.com npm run smoke
 *
 * Requires Node 18+ (uses the built-in global `fetch`). No dependencies.
 * Exit code: 0 = all passed, 1 = one or more failures, 2 = server unreachable.
 * ---------------------------------------------------------------------------
 */

const BASE_URL = (process.argv[2] || process.env.BASE_URL || "http://localhost:3000").replace(
  /\/+$/,
  "",
);

/* ── Tiny test harness ──────────────────────────────────────────────────── */

const C = process.stdout.isTTY
  ? { g: "\x1b[32m", r: "\x1b[31m", y: "\x1b[33m", b: "\x1b[34m", d: "\x1b[2m", B: "\x1b[1m", x: "\x1b[0m" }
  : { g: "", r: "", y: "", b: "", d: "", B: "", x: "" };

let passed = 0;
let failed = 0;
let warned = 0;

function section(title) {
  console.log(`\n${C.B}${C.b}▸ ${title}${C.x}`);
}
function ok(msg, detail = "") {
  passed++;
  console.log(`  ${C.g}✓${C.x} ${msg}${detail ? ` ${C.d}${detail}${C.x}` : ""}`);
}
function bad(msg, detail = "") {
  failed++;
  console.log(`  ${C.r}✗ ${msg}${C.x}${detail ? ` ${C.d}${detail}${C.x}` : ""}`);
}
function warn(msg, detail = "") {
  warned++;
  console.log(`  ${C.y}!${C.x} ${msg}${detail ? ` ${C.d}${detail}${C.x}` : ""}`);
}
function info(msg) {
  console.log(`  ${C.d}· ${msg}${C.x}`);
}

/** Hard assertion — records pass/fail. */
function check(cond, msg, detail = "") {
  if (cond) ok(msg, detail);
  else bad(msg, detail);
  return Boolean(cond);
}

const isStr = (v) => typeof v === "string" && v.length > 0;
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const isArr = (v) => Array.isArray(v);
const isHttpUrl = (v) => isStr(v) && /^https?:\/\//i.test(v);

/** GET a path and parse JSON, capturing status, latency and parse errors. */
async function get(path) {
  const url = `${BASE_URL}${path}`;
  const started = Date.now();
  const res = await fetch(url, { headers: { accept: "application/json" } });
  const ms = Date.now() - started;
  const text = await res.text();
  let json = null;
  let parseError = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (e) {
    parseError = e.message;
  }
  return { url, status: res.status, ok: res.ok, ms, json, text, parseError };
}

/** Validate the standard { page, limit, total, totalPages } pagination block. */
function checkPagination(p, label) {
  const good =
    p &&
    isNum(p.page) &&
    isNum(p.limit) &&
    isNum(p.total) &&
    isNum(p.totalPages);
  check(good, `${label}: pagination envelope is well-formed`, good ? `total=${p.total}` : JSON.stringify(p));
  return good ? p : null;
}

/** Validate the fields a CasinoApp must always carry (both list & detail reads). */
function checkCoreApp(app, label) {
  check(isStr(app?.id), `${label}: id is a non-empty string`);
  check(isStr(app?.slug), `${label}: slug is a non-empty string`);
  check(isStr(app?.name), `${label}: name is a non-empty string`);
  check(isNum(app?.rating) && app.rating >= 0 && app.rating <= 5, `${label}: rating is 0–5`, `= ${app?.rating}`);
  check(isNum(app?.trustScore) && app.trustScore >= 0 && app.trustScore <= 100, `${label}: trustScore is 0–100`, `= ${app?.trustScore}`);
  check(isArr(app?.categories), `${label}: categories is an array`);
}

/* ── Suite ──────────────────────────────────────────────────────────────── */

async function main() {
  console.log(`${C.B}AceVault API smoke test${C.x}`);
  console.log(`${C.d}Target: ${BASE_URL}${C.x}`);

  // Connectivity guard: fail fast with guidance if the server isn't up.
  let firstList;
  try {
    firstList = await get("/api/apps?limit=8");
  } catch (err) {
    console.log(
      `\n${C.r}Could not reach ${BASE_URL}.${C.x}\n` +
        `${C.d}${err.code || err.message}${C.x}\n\n` +
        `Start the server first:\n  ${C.B}npm run dev${C.x}\n` +
        `then re-run:\n  ${C.B}node scripts/smoke-test-api.mjs${C.x}\n`,
    );
    process.exit(2);
  }

  /* 1. GET /api/apps ------------------------------------------------------- */
  section("GET /api/apps");
  check(firstList.status === 200, "responds 200", `(${firstList.ms}ms)`);
  check(!firstList.parseError, "returns valid JSON", firstList.parseError || "");
  const list = firstList.json;
  const listData = list?.data;
  check(isArr(listData), "body.data is an array");
  const haveApps = isArr(listData) && listData.length > 0;
  check(haveApps, "returns at least one app", haveApps ? `count=${listData.length}` : "EMPTY — is the DB seeded?");
  checkPagination(list?.pagination, "GET /api/apps");

  if (!haveApps) {
    finish();
    return;
  }

  checkCoreApp(listData[0], "list[0]");

  // Logos are available on LIST reads (icon is not projected out) → measure coverage.
  const listWithLogo = listData.filter((a) => isHttpUrl(a.logoUrl)).length;
  if (listWithLogo > 0) ok("real app logos present on list", `${listWithLogo}/${listData.length} have logoUrl`);
  else warn("no logoUrl on any listed app", "logos will fall back to monograms");

  // `limit` must be honoured and echoed back.
  const limited = await get("/api/apps?limit=3");
  check(limited.status === 200 && isArr(limited.json?.data) && limited.json.data.length <= 3, "?limit=3 caps the page", `got ${limited.json?.data?.length}`);
  check(limited.json?.pagination?.limit === 3, "?limit=3 echoed in pagination.limit", `= ${limited.json?.pagination?.limit}`);

  // Sort contract: rating desc should be non-increasing.
  const sorted = await get("/api/apps?sort=rating&order=desc&limit=10");
  if (sorted.status === 200 && isArr(sorted.json?.data) && sorted.json.data.length > 1) {
    const rs = sorted.json.data.map((a) => a.rating);
    const nonIncreasing = rs.every((v, i) => i === 0 || rs[i - 1] >= v);
    check(nonIncreasing, "?sort=rating&order=desc is non-increasing", `[${rs.join(", ")}]`);
  } else {
    warn("could not verify sort ordering", "too few apps");
  }

  const topSlugs = listData.map((a) => a.slug).filter(isStr);

  // Real-data coverage should be measured on the DATA-RICH apps. The default
  // list is sorted by editorial score, which surfaces niche listings that
  // often lack a ratings histogram or screenshots. The most-reviewed apps are
  // where Google Play actually stores that metadata, so sample from there.
  const richList = await get("/api/apps?sort=reviews&order=desc&limit=12");
  const richSlugs = (isArr(richList.json?.data) ? richList.json.data : [])
    .map((a) => a.slug)
    .filter(isStr);
  // Prefer the most-reviewed app for reviews/history reads too (more to show).
  const firstSlug = richSlugs[0] || topSlugs[0];

  /* 2. GET /api/categories ------------------------------------------------- */
  section("GET /api/categories");
  const cats = await get("/api/categories");
  check(cats.status === 200, "responds 200", `(${cats.ms}ms)`);
  const catData = cats.json?.data;
  check(isArr(catData) && catData.length > 0, "returns categories", `count=${catData?.length}`);
  if (isArr(catData) && catData.length) {
    const c = catData[0];
    check(isStr(c.slug) && isStr(c.name) && isNum(c.count), "category has slug/name/count", `${c.name}=${c.count}`);
  }

  /* 3. GET /api/search ----------------------------------------------------- */
  section("GET /api/search");
  const term = String(listData[0].name).split(/\s+/)[0].slice(0, 6) || "casino";
  const search = await get(`/api/search?q=${encodeURIComponent(term)}`);
  check(search.status === 200, "responds 200", `(${search.ms}ms)`);
  check(isArr(search.json?.data), "body.data is an array");
  check(isArr(search.json?.data) && search.json.data.length > 0, `finds results for "${term}"`, `count=${search.json?.data?.length}`);
  checkPagination(search.json?.pagination, "GET /api/search");

  /* 4. GET /api/apps/[packageName] — detail reads + REAL DATA -------------- */
  section("GET /api/apps/[packageName] — detail + real data");
  // Sample the most-reviewed apps (fall back to the score-sorted list if the
  // review-sorted query returned nothing), so the coverage check runs against
  // the listings that carry real screenshots / histograms.
  const sample = (richSlugs.length ? richSlugs : topSlugs).slice(0, 8);
  const coverage = { logo: 0, realShots: 0, histogram: 0, installs: 0, contentRating: 0, version: 0 };
  let detailChecked = 0;

  for (const slug of sample) {
    const d = await get(`/api/apps/${encodeURIComponent(slug)}`);
    if (d.status !== 200 || !d.json?.data) {
      bad(`detail ${slug}: expected 200 with data`, `status=${d.status}`);
      continue;
    }
    detailChecked++;
    const app = d.json.data;
    if (detailChecked === 1) {
      // Full contract check on the first detail record only (keeps output tight).
      checkCoreApp(app, `detail(${slug})`);
      check(app.slug === slug, "detail slug matches request", `${app.slug}`);
      check(isArr(app.screenshots), "detail has screenshots array");
    }

    // Per-app real-data tally, and a one-line coverage note so failures are
    // easy to localise to a specific listing.
    const found = [];
    if (isHttpUrl(app.logoUrl)) {
      coverage.logo++;
      found.push("logo");
    }
    if (isArr(app.screenshots) && app.screenshots.some((s) => isHttpUrl(s.url))) {
      coverage.realShots++;
      found.push("shots");
    }
    if (isArr(app.ratingHistogram) && app.ratingHistogram.length) {
      const bars = app.ratingHistogram;
      const barsValid = bars.every((b) => isNum(b.stars) && b.stars >= 1 && b.stars <= 5 && isNum(b.count) && b.count >= 0);
      if (barsValid) {
        coverage.histogram++;
        found.push("histogram");
      } else {
        bad(`detail ${slug}: ratingHistogram bars malformed`, JSON.stringify(bars));
      }
    }
    if (isStr(app.installs)) {
      coverage.installs++;
      found.push("installs");
    }
    if (isStr(app.contentRating)) {
      coverage.contentRating++;
      found.push("contentRating");
    }
    if (isStr(app.version)) {
      coverage.version++;
      found.push("version");
    }
    info(`${slug} → ${found.length ? found.join(", ") : "no real fields"}`);
  }

  info(`sampled ${detailChecked} most-reviewed detail record(s)`);

  // Hard checks — the new UI features must have real data to render somewhere.
  check(coverage.realShots > 0, "real screenshot URLs present", `${coverage.realShots}/${detailChecked} apps`);
  check(coverage.histogram > 0, "real rating histogram present", `${coverage.histogram}/${detailChecked} apps`);
  check(coverage.logo > 0, "real logos present on detail reads", `${coverage.logo}/${detailChecked} apps`);

  // Soft checks — "At a glance" Play metadata (nice-to-have per record).
  reportSoft("installs", coverage.installs, detailChecked);
  reportSoft("contentRating", coverage.contentRating, detailChecked);
  reportSoft("version", coverage.version, detailChecked);

  /* 5. GET /api/apps/[packageName]/reviews --------------------------------- */
  section("GET /api/apps/[packageName]/reviews");
  const rev = await get(`/api/apps/${encodeURIComponent(firstSlug)}/reviews?limit=5`);
  check(rev.status === 200, "responds 200", `(${rev.ms}ms)`);
  check(isArr(rev.json?.data), "body.data is an array");
  checkPagination(rev.json?.pagination, "reviews");
  if (isArr(rev.json?.data) && rev.json.data.length) {
    const r = rev.json.data[0];
    check(isStr(r.id) && isStr(r.author) && isNum(r.score) && isStr(r.text) && isNum(r.thumbsUp) && isStr(r.publishedAt), "review DTO shape is valid", `by ${r.author}`);
  } else {
    warn(`no reviews stored for ${firstSlug}`, "endpoint OK, data empty");
  }

  /* 6. GET /api/apps/[packageName]/history --------------------------------- */
  section("GET /api/apps/[packageName]/history");
  const hist = await get(`/api/apps/${encodeURIComponent(firstSlug)}/history?limit=30`);
  check(hist.status === 200, "responds 200", `(${hist.ms}ms)`);
  check(isArr(hist.json?.data), "body.data is an array");
  const hp = hist.json?.data;
  if (isArr(hp) && hp.length) {
    const p = hp[0];
    check(isStr(p.date) && isNum(p.score) && isNum(p.reviews) && isNum(p.ratings) && isNum(p.installs), "history point shape is valid");
    if (hp.length > 1) {
      const asc = new Date(hp[0].date).getTime() <= new Date(hp[hp.length - 1].date).getTime();
      check(asc, "history ordered oldest → newest");
    }
  } else {
    warn(`no history snapshots for ${firstSlug}`, "endpoint OK, data empty");
  }

  /* 7. 404 handling -------------------------------------------------------- */
  section("Error handling");
  const missing = await get("/api/apps/__does_not_exist__.pkg");
  check(missing.status === 404, "unknown app → 404", `status=${missing.status}`);
  check(isStr(missing.json?.error), "404 body carries { error }", missing.json?.error || "");

  finish();
}

function reportSoft(field, count, total) {
  if (count > 0) ok(`${field} present`, `${count}/${total} apps`);
  else warn(`${field} missing on sampled apps`, "'At a glance' will omit this row");
}

function finish() {
  const total = passed + failed;
  console.log(
    `\n${C.B}Summary:${C.x} ${C.g}${passed} passed${C.x}, ` +
      `${failed ? C.r : C.d}${failed} failed${C.x}` +
      `${warned ? `, ${C.y}${warned} warning(s)${C.x}` : ""} ` +
      `${C.d}(${total} checks)${C.x}`,
  );
  if (failed > 0) {
    console.log(`${C.r}RESULT: FAIL${C.x}`);
    process.exit(1);
  }
  console.log(`${C.g}RESULT: PASS${C.x}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`\n${C.r}Smoke test crashed:${C.x} ${err.stack || err.message}`);
  process.exit(1);
});
