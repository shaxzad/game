import * as React from "react";
import type { Metadata } from "next";
import { getApps, getCategories } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { CategoryCard } from "@/components/category-card";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = pageMetadata({
  title: "Categories",
  description:
    "Browse casino apps by what they do best — live dealer, slots, crypto, fast payouts, mobile-first and more.",
  path: "/categories",
  keywords: ["casino categories", "live dealer apps", "crypto casino apps"],
});

export default async function CategoriesPage() {
  const [categories, apps] = await Promise.all([getCategories(), getApps()]);

  const countFor = (slug: string) =>
    apps.filter((app) => app.categories.some((c) => c.slug === slug)).length;

  return (
    <>
      <PageHeader
        eyebrow="Find your fit"
        title="Casino app categories"
        description="Not every app is built for every player. Start from the way you like to play and we'll take it from there."
        crumbs={[{ name: "Categories", href: "/categories" }]}
      />
      <div className="container-tight py-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, i) => (
            <Reveal key={category.slug} delay={i * 50}>
              <CategoryCard category={category} count={countFor(category.slug)} />
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
