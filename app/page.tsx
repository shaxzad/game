import * as React from "react";
import { ShieldCheck, Wallet, Gauge } from "lucide-react";
import { getHomepageData, getApps } from "@/lib/api";
import { Hero } from "@/components/hero";
import { SectionHeader } from "@/components/section-header";
import { AppCard } from "@/components/app-card";
import { ReviewCard } from "@/components/review-card";
import { CategoryCard } from "@/components/category-card";
import { ArticleCard } from "@/components/article-card";
import { Newsletter } from "@/components/newsletter";
import { Reveal } from "@/components/reveal";
import { Marquee } from "@/components/marquee";

export default async function HomePage() {
  const { trending, topRated, featured, latestNews, latestGuides, categories } =
    await getHomepageData();
  const allApps = await getApps();
  const topPick = topRated[0] ?? allApps[0] ?? null;

  const appCounts = new Map<string, number>();
  for (const app of allApps)
    for (const c of app.categories)
      appCounts.set(c.slug, (appCounts.get(c.slug) ?? 0) + 1);

  return (
    <>
      {topPick ? <Hero topPick={topPick} appCount={allApps.length} /> : null}

      {/* Trust strip */}
      <section className="border-y border-border bg-muted/20 py-6">
        <div className="container-tight">
          <Marquee>
            {[
              "Licenses verified",
              "Payouts tested hands-on",
              "12 data points per app",
              "No pay-for-rank",
              "Bonus terms decoded",
              "Updated monthly",
            ].map((t) => (
              <span
                key={t}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <ShieldCheck className="h-4 w-4 text-primary" />
                {t}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* Trending */}
      <section className="container-tight py-16 sm:py-20">
        <SectionHeader
          eyebrow="Moving now"
          title="Trending apps"
          description="What players are downloading and searching for this week."
          action={{ label: "All apps", href: "/apps" }}
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map((app, i) => (
            <Reveal key={app.id} delay={i * 60}>
              <AppCard app={app} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Top rated */}
      <section className="border-y border-border bg-muted/20 py-16 sm:py-20">
        <div className="container-tight">
          <SectionHeader
            eyebrow="By the numbers"
            title="Top rated by trust score"
            description="Ranked on our transparent 0–100 trust model — licensing, payouts, complaints and player protection."
            action={{
              label: "How we rate",
              href: "/guides/how-we-rate-casino-apps",
            }}
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topRated.map((app, i) => (
              <Reveal key={app.id} delay={i * 60}>
                <AppCard app={app} rank={i + 1} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured reviews */}
      <section className="container-tight py-16 sm:py-20">
        <SectionHeader
          eyebrow="Editor's desk"
          title="Featured reviews"
          description="Long-form verdicts on the apps we think are worth your attention right now."
          action={{ label: "All reviews", href: "/reviews" }}
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {featured.map((app, i) => (
            <Reveal key={app.id} delay={i * 80}>
              <ReviewCard app={app} className="h-full" />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-border bg-muted/20 py-16 sm:py-20">
        <div className="container-tight">
          <SectionHeader
            eyebrow="Find your game"
            title="Browse by category"
            description="From slots to sportsbooks — jump straight to the apps that do your kind of play best."
            action={{ label: "All categories", href: "/categories" }}
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c, i) => (
              <Reveal key={c.slug} delay={i * 50}>
                <CategoryCard category={c} count={appCounts.get(c.slug)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why AceVault */}
      <section className="container-tight py-16 sm:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Licenses, verified",
              body: "We check every license number against the regulator's own register — not just the badge in the footer.",
            },
            {
              icon: Wallet,
              title: "Payouts, tested",
              body: "We deposit and withdraw for real, then time it. Payout speed is scored on evidence, not marketing.",
            },
            {
              icon: Gauge,
              title: "Scored in the open",
              body: "Every rating breaks down into five weighted pillars you can see and disagree with. No black boxes.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <div className="h-full rounded-2xl border border-border bg-card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Latest news + guides */}
      <section className="border-t border-border bg-muted/20 py-16 sm:py-20">
        <div className="container-tight grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              eyebrow="The wire"
              title="Latest news"
              action={{ label: "All news", href: "/news" }}
            />
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {latestNews.slice(0, 2).map((n) => (
                <ArticleCard key={n.slug} article={n} basePath="/news" />
              ))}
            </div>
          </div>
          <div>
            <SectionHeader
              eyebrow="Get sharper"
              title="Guides"
              action={{ label: "All guides", href: "/guides" }}
            />
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {latestGuides.slice(0, 2).map((g) => (
                <ArticleCard key={g.slug} article={g} basePath="/guides" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container-tight py-16 sm:py-20">
        <Newsletter />
      </section>
    </>
  );
}
