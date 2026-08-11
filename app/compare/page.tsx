import * as React from "react";
import type { Metadata } from "next";
import { getApps } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { CompareTool } from "@/components/compare-tool";

export const metadata: Metadata = pageMetadata({
  title: "Compare Apps",
  description:
    "Put casino apps side by side — trust scores, welcome bonuses, wagering, payout speeds and licensing, compared at a glance.",
  path: "/compare",
  keywords: ["compare casino apps", "casino comparison", "best casino bonus"],
});

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ apps?: string }>;
}) {
  const { apps: appsParam } = await searchParams;
  const slugs = (appsParam ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const apps = await getApps();

  return (
    <>
      <PageHeader
        eyebrow="Head to head"
        title="Compare casino apps"
        description="Pick up to three apps and see the numbers that matter lined up — the best value in every row is highlighted for you."
        crumbs={[{ name: "Compare", href: "/compare" }]}
      />
      <div className="container-tight py-10">
        <CompareTool apps={apps} initialSlugs={slugs} />
      </div>
    </>
  );
}
