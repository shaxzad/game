import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNews, getNewsBySlug } from "@/lib/api";
import { pageMetadata, articleLd, breadcrumbLd } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { CoverArt } from "@/components/cover-art";
import { ArticleCard } from "@/components/article-card";
import { Newsletter } from "@/components/newsletter";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format";

export async function generateStaticParams() {
  const news = await getNews();
  return news.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return {};
  return pageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/news/${article.slug}`,
    type: "article",
    keywords: [article.category],
  });
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  const path = `/news/${article.slug}`;
  const crumbs = [
    { name: "News", href: "/news" },
    { name: article.title, href: path },
  ];

  const others = (await getNews())
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(crumbs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd(article, path)) }}
      />

      <PageHeader eyebrow={article.category} title={article.title} crumbs={crumbs}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{article.author}</span>
          <span aria-hidden>·</span>
          <span>{formatDate(article.publishedAt)}</span>
          <span aria-hidden>·</span>
          <span>{article.category}</span>
        </div>
      </PageHeader>

      <article className="container-tight py-10">
        <div className="overflow-hidden rounded-2xl border border-border">
          <CoverArt seed={article.coverSeed} label={article.category} ratio="aspect-[21/9]" />
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          {article.body.map((paragraph, i) => (
            <p
              key={i}
              className={cn(
                "leading-relaxed text-muted-foreground",
                i === 0 ? "text-lg text-foreground/90" : "mt-5 text-base"
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
            More news
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((a) => (
              <ArticleCard key={a.slug} article={a} basePath="/news" />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
