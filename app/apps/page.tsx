import * as React from "react";
import type { Metadata } from "next";
import { getApps, getCategories } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { AppsExplorer } from "@/components/apps-explorer";

export const metadata: Metadata = pageMetadata({
  title: "Casino Apps",
  description:
    "Browse and filter every casino and gambling app we've reviewed — by category, platform, trust score and bonus. Sort by what matters to you.",
  path: "/apps",
  keywords: ["casino apps", "gambling apps", "best casino apps"],
});

export default async function AppsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [apps, categories] = await Promise.all([getApps(), getCategories()]);

  return (
    <>
      <PageHeader
        eyebrow="The directory"
        title="Casino apps"
        description="Every app in our index, with the filters to cut it down to the ones built for how you play."
        crumbs={[{ name: "Casino Apps", href: "/apps" }]}
      />
      <div className="container-tight py-10">
        <AppsExplorer apps={apps} categories={categories} initialCategory={category} />
      </div>
    </>
  );
}
