import * as React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Timer } from "lucide-react";
import type { CasinoApp } from "@/types";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { TrustDial } from "@/components/trust-dial";
import { RatingStars } from "@/components/rating-stars";
import { AppLogo } from "@/components/app-logo";
import { StatCounter } from "@/components/stat-counter";

/**
 * Homepage hero. The thesis: casino apps judged like fintech. The signature
 * Trust Dial fronts a "top pick" card; a vault-grid aurora sets the mood.
 */
export function Hero({
  topPick,
  appCount,
}: {
  topPick: CasinoApp;
  appCount: number;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="aurora pointer-events-none absolute inset-0" />
      <div className="grid-texture pointer-events-none absolute inset-0 opacity-60" />

      <div className="container-tight relative py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3.5 py-1.5 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Independent, hands-on casino app reviews
            </div>

            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Casino apps,
              <br />
              reviewed like{" "}
              <span className="text-gradient">fintech.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              We verify licenses, test real payouts and score every app on a
              transparent trust model — so you never download blind. No hype,
              just the numbers that matter.
            </p>

            <div className="mt-7 max-w-md">
              <SearchBar size="lg" placeholder="Search 20+ reviewed apps…" />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/apps">
                  Browse all apps
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/compare">Compare top picks</Link>
              </Button>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-7">
              <StatCounter value={appCount} suffix="+" label="Apps reviewed" />
              <StatCounter value={12} label="Data points each" />
              <StatCounter value={100} suffix="%" label="Independent" />
            </dl>
          </div>

          <div className="relative">
            <div className="glass relative mx-auto max-w-sm rounded-3xl border border-border p-6 shadow-glow">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-semibold text-gold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Top rated this month
                </span>
              </div>

              <div className="mt-6 flex flex-col items-center text-center">
                <TrustDial score={topPick.trustScore} size={150} />
                <div className="mt-8 flex items-center gap-3">
                  <AppLogo seed={topPick.logoSeed} monogram={topPick.monogram} size={44} />
                  <div className="text-left">
                    <div className="font-display text-lg font-semibold leading-tight">
                      {topPick.name}
                    </div>
                    <RatingStars value={topPick.rating} size={14} showValue />
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-border bg-background/40 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Timer className="h-3.5 w-3.5" />
                    Payout
                  </div>
                  <div className="mt-1 font-semibold">{topPick.payoutTime}</div>
                </div>
                <div className="rounded-xl border border-border bg-background/40 p-3">
                  <div className="text-xs text-muted-foreground">Min deposit</div>
                  <div className="mt-1 font-semibold">${topPick.minDeposit}</div>
                </div>
              </div>

              <Button asChild className="mt-5 w-full" variant="gold">
                <Link href={`/reviews/${topPick.slug}`}>
                  Read the review
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
