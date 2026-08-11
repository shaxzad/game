import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGuides, getGuideBySlug } from "@/lib/api";
import { pageMetadata, articleLd, breadcrumbLd } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { CoverArt } from "@/components/cover-art";
import { ArticleCard } from "@/components/article-card";
import { Newsletter } from "@/components/newsletter";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format";

export async function generateStaticParams() {
  const guides = await getGuides();
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return {};
  return pageMetadata({
    title: guide.title,
    description: guide.excerpt,
    path: `/guides/${guide.slug}`,
    type: "article",
    keywords: [guide.category, guide.level],
  });
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const path = `/guides/${guide.slug}`;
  const crumbs = [
    { name: "Guides", href: "/guides" },
    { name: guide.title, href: path },
  ];

  const others = (await getGuides())
    .filter((g) => g.slug !== guide.slug)
    .slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(crumbs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd(guide, path)) }}
      />

      <PageHeader eyebrow={guide.category} title={guide.title} crumbs={crumbs}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{guide.author}</span>
          <span aria-hidden>·</span>
          <span>{formatDate(guide.publishedAt)}</span>
          <span aria-hidden>·</span>
          <span>{guide.readingTime} min read</span>
          <Badge variant="outline" className="ml-1">
            {guide.level}
          </Badge>
        </div>
      </PageHeader>

      <article className="container-tight py-10">
        <div className="overflow-hidden rounded-2xl border border-border">
          <CoverArt seed={guide.coverSeed} label={guide.category} ratio="aspect-[21/9]" />
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          {guide.body.map((paragraph, i) => (
            <p
              key={i}
              className={cn(
                "leading-relaxed text-muted-foreground",
                i === 0
                  ? "text-lg text-foreground/90"
                  : "mt-5 text-base"
              )}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <Newsletter />
        </div>
      </article>

      {others.length > 0 && (
        <section className="container-tight pb-16">
          <h2 className="mb-6 font-display text-2xl font-bold tracking-tight">
            More guides
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((g) => (
              <ArticleCard key={g.slug} article={g} basePath="/guides" />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
