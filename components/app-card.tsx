import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Coins, Zap } from "lucide-react";
import type { CasinoApp } from "@/types";
import { AppLogo } from "@/components/app-logo";
import { RatingStars } from "@/components/rating-stars";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCompact } from "@/utils/format";
import { cn } from "@/lib/utils";

interface AppCardProps {
  app: CasinoApp;
  rank?: number;
  className?: string;
}

/**
 * Primary app tile used across listings, the homepage and category pages.
 * Shows logo, rating, a compact trust readout, headline bonus and key facts.
 */
export function AppCard({ app, rank, className }: AppCardProps) {
  return (
    <Card
      className={cn(
        "lift group relative flex flex-col overflow-hidden p-5",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <AppLogo seed={app.logoSeed} monogram={app.monogram} src={app.logoUrl} alt={app.name} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {rank != null && (
              <span className="font-display text-sm font-bold text-muted-foreground/70">
                #{rank}
              </span>
            )}
            <h3 className="truncate font-display text-base font-semibold tracking-tight">
              <Link href={`/reviews/${app.slug}`} className="after:absolute after:inset-0">
                {app.name}
              </Link>
            </h3>
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {app.tagline}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <RatingStars value={app.rating} size={13} />
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {app.rating.toFixed(1)} · {formatCompact(app.reviewsCount)} reviews
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-display text-xl font-bold tabular-nums text-primary">
            {app.trustScore}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Trust
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-gold/30 bg-gold/5 px-3 py-2">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-gold">
          <Coins className="h-3.5 w-3.5" />
          Welcome bonus
        </div>
        <p className="mt-0.5 line-clamp-1 text-sm font-semibold">{app.bonus.headline}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {app.categories.slice(0, 2).map((c) => (
          <Badge key={c.slug} variant="secondary">
            {c.name}
          </Badge>
        ))}
        <Badge variant="muted" className="gap-1">
          <Zap className="h-3 w-3" />
          {app.payoutTime}
        </Badge>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span>Min deposit ${app.minDeposit}</span>
        <span className="inline-flex items-center gap-1 font-medium text-foreground transition-colors group-hover:text-primary">
          Read review
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Card>
  );
}
