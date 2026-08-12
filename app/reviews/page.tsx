import * as React from "react";
import type { Metadata } from "next";
import { getAppsPage } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { ReviewsGrid } from "@/components/reviews-grid";

export const metadata: Metadata = pageMetadata({
  title: "Casino Reviews",
  description:
    "Every casino app we've reviewed, ranked by our editors — verified licenses, trust scores, payout speeds and bonuses, tested hands-on.",
  path: "/reviews",
  keywords: ["casino reviews", "casino app reviews", "best casino apps"],
});

export default async function ReviewsPage() {
  const { items, total } = await getAppsPage({ sort: "rating", limit: 24 });

  return (
    <>
      <PageHeader
        eyebrow="Editor-tested"
        title="Casino app reviews"
        description="Casino apps, reviewed like fintech. Each write-up is built from hands-on testing, license checks and real payout timings — no download blind."
        crumbs={[{ name: "Reviews", href: "/reviews" }]}
      />
      <div className="container-tight py-10">
        <ReviewsGrid initialApps={items} initialTotal={total} />
      </div>
    </>
  );
}
