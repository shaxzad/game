import * as React from "react";
import type { Metadata } from "next";
import { getApps } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { AppCard } from "@/components/app-card";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = pageMetadata({
  title: "Casino Reviews",
  description:
    "Every casino app we've reviewed, ranked by our editors — verified licenses, trust scores, payout speeds and bonuses, tested hands-on.",
  path: "/reviews",
  keywords: ["casino reviews", "casino app reviews", "best casino apps"],
});

export default async function ReviewsPage() {
  const apps = await getApps({ sort: "rating" });

  return (
    <>
      <PageHeader
        eyebrow="Editor-tested"
        title="Casino app reviews"
        description="Casino apps, reviewed like fintech. Each write-up is built from hands-on testing, license checks and real payout timings — no download blind."
        crumbs={[{ name: "Reviews", href: "/reviews" }]}
      />
      <div className="container-tight py-10">
        <p className="mb-6 text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{apps.length}</span>{" "}
          {apps.length === 1 ? "review" : "reviews"}, highest rated first.
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app, i) => (
            <Reveal key={app.slug} delay={i * 50}>
              <AppCard app={app} />
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
