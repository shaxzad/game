import * as React from "react";
import type { Metadata } from "next";
import { getGuides, getNews } from "@/lib/api";
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
  // Apps are searched live against the whole database inside SearchResults via
  // /api/search. Guides & news are a small editorial set, loaded once here.
  const [guides, news] = await Promise.all([getGuides(), getNews()]);

  return (
    <>
      <PageHeader
        eyebrow="Find anything"
        title="Search"
        description="One box across every app, review, guide and news story we publish."
        crumbs={[{ name: "Search", href: "/search" }]}
      />
      <React.Suspense fallback={<div className="container-tight py-16" />}>
        <SearchResults guides={guides} news={news} />
      </React.Suspense>
    </>
  );
}
