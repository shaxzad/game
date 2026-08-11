import * as React from "react";
import type { Metadata } from "next";
import { getGuides } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { ArticleCard } from "@/components/article-card";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = pageMetadata({
  title: "Guides",
  description:
    "Plain-English guides to playing smart — bonuses and wagering, payout speeds, licensing, bankroll and staying in control.",
  path: "/guides",
  keywords: ["casino guides", "how to read casino bonuses", "wagering explained"],
});

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <>
      <PageHeader
        eyebrow="Learn the game"
        title="Guides"
        description="No fluff, no hype. Clear explainers that help you read the fine print, spot the good offers and play within your limits."
        crumbs={[{ name: "Guides", href: "/guides" }]}
      />
      <div className="container-tight py-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide, i) => (
            <Reveal key={guide.slug} delay={i * 50}>
              <ArticleCard article={guide} basePath="/guides" />
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
