import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getNews } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { ArticleCard } from "@/components/article-card";
import { CoverArt } from "@/components/cover-art";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/format";

export const metadata: Metadata = pageMetadata({
  title: "News",
  description:
    "Casino app news that actually matters — regulation, licensing, bonuses, payouts and product changes, reported straight.",
  path: "/news",
  keywords: ["casino news", "gambling regulation news", "casino bonus news"],
});

export default async function NewsPage() {
  const articles = await getNews();
  const [featured, ...rest] = articles;

  return (
    <>
      <PageHeader
        eyebrow="The wire"
        title="News"
        description="What's moving in real-money apps — new licenses, rule changes and the offers worth knowing about, without the press-release spin."
        crumbs={[{ name: "News", href: "/news" }]}
      />
      <div className="container-tight py-10">
        {featured && (
          <Reveal>
            <Link
              href={`/news/${featured.slug}`}
              className="lift group relative mb-10 grid overflow-hidden rounded-3xl border border-border bg-card md:grid-cols-2"
            >
              <CoverArt
                seed={featured.coverSeed}
                label={featured.category}
                ratio="aspect-[16/10] md:aspect-auto md:h-full"
              />
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <Badge variant="gold" className="w-fit">
                  Latest
                </Badge>
                <h2 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {featured.excerpt}
                </p>
                <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{featured.author}</span>
                  <span aria-hidden>·</span>
                  <span>{formatDate(featured.publishedAt)}</span>
                </div>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Read the story
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          </Reveal>
        )}

        {rest.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article, i) => (
              <Reveal key={article.slug} delay={i * 50}>
                <ArticleCard article={article} basePath="/news" />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
