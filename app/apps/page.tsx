import * as React from "react";
import type { Metadata } from "next";
import { getAppsPage, getCategories } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { AppsExplorer } from "@/components/apps-explorer";

export const metadata: Metadata = pageMetadata({
  title: "Casino Apps",
  description:
    "Browse and filter every casino and gambling app we've reviewed — by category, trust score and rating. Sort by what matters to you.",
  path: "/apps",
  keywords: ["casino apps", "gambling apps", "best casino apps"],
});

/** Apps shown on first paint; the rest stream in on scroll. Must match the
 *  explorer's default sort so the seed lines up with its initial query. */
const INITIAL_PAGE_SIZE = 24;

export default async function AppsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [{ items, total }, categories] = await Promise.all([
    getAppsPage({ category, sort: "rating", limit: INITIAL_PAGE_SIZE }),
    getCategories(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="The directory"
        title="Casino apps"
        description="Every app in our index, with the filters to cut it down to the ones built for how you play."
        crumbs={[{ name: "Casino Apps", href: "/apps" }]}
      />
      <div className="container-tight py-10">
        <AppsExplorer
          initialApps={items}
          initialTotal={total}
          categories={categories}
          initialCategory={category}
        />
      </div>
    </>
  );
}
