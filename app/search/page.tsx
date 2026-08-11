import * as React from "react";
import type { Metadata } from "next";
import { getApps, getGuides, getNews } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { SearchResults } from "@/components/search-results";

export const metadata: Metadata = pageMetadata({
  title: "Search",
  description:
    "Search AceVault across casino apps, reviews, guides and industry news.",
  path: "/search",
});

export default async function SearchPage() {
  const [apps, guides, news] = await Promise.all([
    getApps(),
    getGuides(),
    getNews(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Find anything"
        title="Search"
        description="One box across every app, review, guide and news story we publish."
        crumbs={[{ name: "Search", href: "/search" }]}
      />
      <React.Suspense fallback={<div className="container-tight py-16" />}>
        <SearchResults apps={apps} guides={guides} news={news} />
      </React.Suspense>
    </>
  );
}
