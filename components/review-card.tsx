import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CasinoApp } from "@/types";
import { AppLogo } from "@/components/app-logo";
import { RatingStars } from "@/components/rating-stars";
import { TrustDial } from "@/components/trust-dial";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Editorial "featured review" card — larger than AppCard, pairs the verdict
 * lede with the Trust Dial. Used in the homepage Featured Reviews section.
 */
export function ReviewCard({
  app,
  className,
}: {
  app: CasinoApp;
  className?: string;
}) {
  return (
    <Card className={cn("lift group relative flex flex-col overflow-hidden", className)}>
      <div className="grid-texture relative flex items-center justify-between gap-4 border-b border-border p-6">
        <div className="flex items-center gap-4">
          <AppLogo seed={app.logoSeed} monogram={app.monogram} size={56} />
          <div>
            <h3 className="font-display text-lg font-semibold tracking-tight">
              <Link href={`/reviews/${app.slug}`} className="after:absolute after:inset-0">
                {app.name}
              </Link>
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <RatingStars value={app.rating} size={14} />
              <span className="text-xs font-medium text-muted-foreground">
                Editor {app.editorScore.toFixed(1)}/5
              </span>
            </div>
          </div>
        </div>
        <TrustDial score={app.trustScore} size={92} stroke={8} className="hidden sm:inline-grid" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {app.verdict[0]}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {app.pros.slice(0, 2).map((pro) => (
            <span
              key={pro}
              className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500"
            >
              {pro}
            </span>
          ))}
        </div>
        <div className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors group-hover:text-primary/80">
          Read the full review
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Card>
  );
}
