import * as React from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { Guide, NewsArticle } from "@/types";
import { CoverArt } from "@/components/cover-art";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";

type ArticleLike = (Guide | NewsArticle) & { readingTime?: number };

/**
 * Shared card for the Guides and News grids. `basePath` decides where it links
 * (`/guides` or `/news`).
 */
export function ArticleCard({
  article,
  basePath,
  className,
}: {
  article: ArticleLike;
  basePath: "/guides" | "/news";
  className?: string;
}) {
  return (
    <Card className={cn("lift group relative flex flex-col overflow-hidden", className)}>
      <CoverArt seed={article.coverSeed} label={article.category} />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-base font-semibold leading-snug tracking-tight">
          <Link href={`${basePath}/${article.slug}`} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {article.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatDate(article.publishedAt)}</span>
          {article.readingTime != null && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readingTime} min
            </span>
          )}
          {"level" in article && (
            <Badge variant="outline" className="ml-auto">
              {article.level}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
