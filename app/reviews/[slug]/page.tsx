import * as React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ShieldCheck,
  Wallet,
  Globe2,
  Gamepad2,
  CalendarDays,
  Building2,
  Coins,
  Banknote,
  Download,
  Tag,
  Star,
} from "lucide-react";
import type { RatingBreakdown } from "@/types";
import { getAppBySlug, getAppSlugs, getRelatedApps } from "@/lib/api";
import {
  pageMetadata,
  appReviewLd,
  aggregateRatingLd,
  faqLd,
  breadcrumbLd,
} from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { AppLogo } from "@/components/app-logo";
import { RatingStars } from "@/components/rating-stars";
import { TrustDial } from "@/components/trust-dial";
import { ProsCons } from "@/components/pros-cons";
import { FAQ } from "@/components/faq";
import { ScreenshotCard } from "@/components/screenshot-card";
import { CTAButton } from "@/components/cta-button";
import { AppCard } from "@/components/app-card";
import { SectionHeader } from "@/components/section-header";
import { Reveal } from "@/components/reveal";
import {
  Chip,
  PaymentChip,
  PlatformChip,
  LicenseChip,
  CountryChip,
} from "@/components/chips";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCompact, formatCurrency, formatDate } from "@/utils/format";

const BREAKDOWN_LABELS: { key: keyof RatingBreakdown; label: string }[] = [
  { key: "gameVariety", label: "Game variety" },
  { key: "bonuses", label: "Bonuses" },
  { key: "payoutSpeed", label: "Payout speed" },
  { key: "usability", label: "Usability" },
  { key: "support", label: "Support" },
];

export async function generateStaticParams() {
  const slugs = await getAppSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const app = await getAppBySlug(slug);
  if (!app) return {};
  return pageMetadata({
    title: `${app.name} Review`,
    description: `${app.name} review — ${app.tagline}. Trust score ${app.trustScore}/100, rated ${app.rating.toFixed(
      1
    )}/5 from ${formatCompact(
      app.reviewsCount
    )} player reviews. Bonuses, payouts, safety and our full verdict.`,
    path: `/reviews/${app.slug}`,
    type: "article",
    keywords: [
      `${app.name} review`,
      `${app.name} app`,
      `${app.name} bonus`,
      ...app.categories.map((c) => c.name),
    ],
  });
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = await getAppBySlug(slug);
  if (!app) notFound();

  const related = await getRelatedApps(app.slug, 3);

  const jsonLd = [
    breadcrumbLd([
      { name: "Home", href: "/" },
      { name: "Reviews", href: "/reviews" },
      { name: app.name, href: `/reviews/${app.slug}` },
    ]),
    appReviewLd(app),
    aggregateRatingLd(app),
    faqLd(app),
  ];

  // "At a glance" facts. Prefer real Google Play metadata (installs, content
  // rating, version) when the record carries it; fall back to the synthetic
  // casino facts so the JSON/mock adapter still renders a full sidebar.
  const factRows: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    href?: string;
  }[] = [
    { icon: Building2, label: "Operator", value: app.operator, href: app.developerWebsite },
    { icon: CalendarDays, label: "Established", value: String(app.established) },
  ];

  const hasPlayMeta = Boolean(app.installs || app.contentRating || app.version);
  if (app.installs) {
    factRows.push({ icon: Download, label: "Installs", value: app.installs });
  }
  if (app.contentRating) {
    factRows.push({ icon: ShieldCheck, label: "Content rating", value: app.contentRating });
  }
  if (app.version) {
    factRows.push({ icon: Tag, label: "Version", value: app.version });
  }
  if (!hasPlayMeta) {
    factRows.push(
      { icon: Gamepad2, label: "Games", value: `${formatCompact(app.gamesCount)}+` },
      { icon: Banknote, label: "Min deposit", value: formatCurrency(app.minDeposit) },
      { icon: Wallet, label: "Payout time", value: app.payoutTime },
    );
  }
  factRows.push({ icon: Coins, label: "Currencies", value: app.currencies.join(", ") });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow={app.categories[0]?.name ?? "Review"}
        title={`${app.name} review`}
        description={app.tagline}
        crumbs={[
          { name: "Reviews", href: "/reviews" },
          { name: app.name, href: `/reviews/${app.slug}` },
        ]}
      />

      <div className="container-tight py-10">
        {/* ── Hero summary card ─────────────────────────────────────────── */}
        <Card className="overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-start gap-5">
              <AppLogo seed={app.logoSeed} monogram={app.monogram} src={app.logoUrl} alt={app.name} size={72} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl font-bold tracking-tight">
                    {app.name}
                  </h2>
                  {app.trending && <Badge variant="gold">Trending</Badge>}
                  {app.featured && <Badge variant="secondary">Editor&apos;s pick</Badge>}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <RatingStars value={app.rating} showValue size={16} />
                  <span className="text-sm text-muted-foreground">
                    {formatCompact(app.reviewsCount)} reviews
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {app.license.map((a) => (
                    <LicenseChip key={a} authority={a} />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {app.platforms.map((p) => (
                    <PlatformChip key={p} platform={p} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-6 sm:flex-row lg:flex-col">
              <TrustDial score={app.trustScore} />
              <div className="w-full sm:w-auto lg:w-full">
                <div className="rounded-xl border border-dashed border-gold/30 bg-gold/5 px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
                    <Coins className="h-3.5 w-3.5" />
                    Welcome bonus
                  </div>
                  <p className="mt-1 text-sm font-semibold">{app.bonus.headline}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {app.bonus.wagering} wagering · min {formatCurrency(app.bonus.minDeposit)}
                    {app.bonus.code ? ` · code ${app.bonus.code}` : ""}
                  </p>
                </div>
                <div className="mt-3 flex justify-center lg:justify-stretch">
                  <CTAButton href={app.affiliateUrl} disclosure className="w-full justify-center">
                    Get bonus at {app.name}
                  </CTAButton>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Body grid ─────────────────────────────────────────────────── */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-12">
            {/* Verdict */}
            <Reveal>
              <section>
                <SectionHeader eyebrow="Our verdict" title={`Is ${app.name} worth it?`} />
                <div className="mt-5 space-y-4">
                  {app.verdict.map((para, i) => (
                    <p
                      key={i}
                      className={
                        i === 0
                          ? "text-base leading-relaxed text-foreground/90"
                          : "text-sm leading-relaxed text-muted-foreground sm:text-base"
                      }
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            </Reveal>

            {/* Rating distribution (real Google Play histogram) or, for mock
                data, the editorial pillar scorecard. */}
            <Reveal>
              <section>
                {app.ratingHistogram && app.ratingHistogram.length > 0 ? (
                  (() => {
                    const bars = app.ratingHistogram!;
                    const total = bars.reduce((sum, b) => sum + b.count, 0);
                    const peak = Math.max(...bars.map((b) => b.count), 1);
                    return (
                      <>
                        <SectionHeader
                          eyebrow="Player ratings"
                          title="How players rate it"
                          description={`Distribution across ${formatCompact(
                            total
                          )} Google Play ratings.`}
                        />
                        <div className="mt-5 space-y-3">
                          {bars.map((bar) => {
                            const pct = total > 0 ? (bar.count / total) * 100 : 0;
                            return (
                              <div key={bar.stars} className="flex items-center gap-4">
                                <span className="flex w-12 shrink-0 items-center gap-1 text-sm font-medium tabular-nums text-muted-foreground">
                                  {bar.stars}
                                  <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                                </span>
                                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className="h-full rounded-full bg-gold"
                                    style={{ width: `${(bar.count / peak) * 100}%` }}
                                  />
                                </div>
                                <span className="w-24 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                                  {formatCompact(bar.count)}
                                  <span className="ml-1 text-xs text-muted-foreground/70">
                                    {pct.toFixed(0)}%
                                  </span>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <>
                    <SectionHeader
                      eyebrow="Scorecard"
                      title="How it rates, pillar by pillar"
                      description="Every AceVault score is the weighted sum of five tested pillars."
                    />
                    <div className="mt-5 space-y-3">
                      {BREAKDOWN_LABELS.map(({ key, label }) => {
                        const val = app.ratingBreakdown[key];
                        return (
                          <div key={key} className="flex items-center gap-4">
                            <span className="w-28 shrink-0 text-sm text-muted-foreground">
                              {label}
                            </span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${(val / 5) * 100}%` }}
                              />
                            </div>
                            <span className="w-9 shrink-0 text-right text-sm font-semibold tabular-nums">
                              {val.toFixed(1)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </section>
            </Reveal>

            {/* Pros & cons */}
            <Reveal>
              <section>
                <SectionHeader eyebrow="The balance" title="Pros & cons" />
                <ProsCons className="mt-5" pros={app.pros} cons={app.cons} />
              </section>
            </Reveal>

            {/* Features */}
            <Reveal>
              <section>
                <SectionHeader eyebrow="What you get" title="Standout features" />
                <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {app.features.map((f) => (
                    <div
                      key={f}
                      className="flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm"
                    >
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>

            {/* Screenshots */}
            <Reveal>
              <section>
                <SectionHeader
                  eyebrow="In the app"
                  title="Screenshots"
                  description="Screens from the app's Google Play listing."
                />
                <div className="mt-5 flex gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
                  {app.screenshots.map((shot, i) => (
                    <ScreenshotCard key={i} shot={shot} className="w-40 sm:w-44" />
                  ))}
                </div>
              </section>
            </Reveal>

            {/* Payments */}
            <Reveal>
              <section>
                <SectionHeader
                  eyebrow="Cashier"
                  title="Payment methods"
                  description={`Deposits and withdrawals with a ${app.payoutTime.toLowerCase()} payout window.`}
                />
                <div className="mt-5 flex flex-wrap gap-2">
                  {app.payments.map((m) => (
                    <PaymentChip key={m} method={m} />
                  ))}
                </div>
              </section>
            </Reveal>

            {/* Countries */}
            <Reveal>
              <section>
                <SectionHeader
                  eyebrow="Availability"
                  title="Supported countries"
                  description="Where this app accepts players. Always confirm eligibility in your own jurisdiction."
                />
                <div className="mt-5 flex flex-wrap gap-2">
                  {app.supportedCountries.map((c) => (
                    <CountryChip key={c} code={c} />
                  ))}
                </div>
                {app.restrictedCountries.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Restricted
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {app.restrictedCountries.map((c) => (
                        <Chip key={c} className="border-rose-500/20 text-rose-500/80">
                          {c}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </Reveal>

            {/* FAQ */}
            <Reveal>
              <section>
                <SectionHeader eyebrow="Good to know" title="Frequently asked questions" />
                <div className="mt-5">
                  <FAQ items={app.faqs} />
                </div>
              </section>
            </Reveal>
          </div>

          {/* ── Sticky sidebar ───────────────────────────────────────────── */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <Card className="p-6">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                At a glance
              </h3>
              <dl className="mt-4 space-y-3.5">
                {factRows.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-muted/40 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {label}
                      </dt>
                      <dd className="truncate text-sm font-medium">
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="transition-colors hover:text-primary"
                          >
                            {value}
                          </a>
                        ) : (
                          value
                        )}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>

              <div className="mt-5 flex flex-wrap gap-1.5 border-t border-border pt-5">
                {app.categories.map((c) => (
                  <Badge key={c.slug} variant="secondary">
                    {c.name}
                  </Badge>
                ))}
              </div>

              <div className="mt-5">
                <CTAButton href={app.affiliateUrl} disclosure className="w-full justify-center">
                  Visit {app.name}
                </CTAButton>
              </div>

              <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Globe2 className="h-3.5 w-3.5" />
                Updated {formatDate(app.updatedAt)}
              </p>
            </Card>
          </aside>
        </div>

        {/* ── Related reviews ───────────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="mt-16">
            <SectionHeader
              eyebrow="Keep comparing"
              title="Related reviews"
              action={{ label: "All reviews", href: "/reviews" }}
            />
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => (
                <Reveal key={r.id} delay={i * 60}>
                  <AppCard app={r} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
