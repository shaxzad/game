import * as React from "react";
import type { Metadata } from "next";
import type { CasinoApp } from "@/types";
import { getAppBySlug, getAppsPage } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { CompareTool } from "@/components/compare-tool";

export const metadata: Metadata = pageMetadata({
  title: "Compare Apps",
  description:
    "Put casino apps side by side — trust scores, ratings, installs, reviews and more, compared at a glance.",
  path: "/compare",
  keywords: ["compare casino apps", "casino comparison", "casino app ratings"],
});

/** Number of top apps to seed when no `?apps=` slugs are supplied. */
const DEFAULT_SEED = 2;

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ apps?: string }>;
}) {
  const { apps: appsParam } = await searchParams;
  const slugs = (appsParam ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  // Resolve the deep-linked apps server-side (not limited to any page cap). If
  // none resolve, fall back to seeding the top couple of apps by rating.
  let initialApps: CasinoApp[] = [];
  if (slugs.length) {
    const resolved = await Promise.all(slugs.map((s) => getAppBySlug(s)));
    initialApps = resolved.filter((a): a is CasinoApp => Boolean(a));
  }
  if (initialApps.length === 0) {
    const { items } = await getAppsPage({ sort: "rating", limit: DEFAULT_SEED });
    initialApps = items;
  }

  return (
    <>
      <PageHeader
        eyebrow="Head to head"
        title="Compare casino apps"
        description="Pick up to three apps and see the numbers that matter lined up — the best value in every row is highlighted for you."
        crumbs={[{ name: "Compare", href: "/compare" }]}
      />
      <div className="container-tight py-10">
        <CompareTool initialApps={initialApps} />
      </div>
    </>
  );
}
