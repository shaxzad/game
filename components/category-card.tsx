import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/types";
import { Icon } from "@/components/icon";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Category tile — icon, name and description, linking to the filtered apps
 * listing. Accent (emerald or gold) comes from the category data.
 */
export function CategoryCard({
  category,
  count,
  className,
}: {
  category: Category;
  count?: number;
  className?: string;
}) {
  const gold = category.accent === "gold";
  return (
    <Card className={cn("lift group relative overflow-hidden p-5", className)}>
      <div
        className={cn(
          "grid h-11 w-11 place-items-center rounded-xl ring-1 ring-inset",
          gold
            ? "bg-gold/10 text-gold ring-gold/20"
            : "bg-primary/10 text-primary ring-primary/20"
        )}
      >
        <Icon name={category.icon} className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-base font-semibold tracking-tight">
        <Link href={`/apps?category=${category.slug}`} className="after:absolute after:inset-0">
          {category.name}
        </Link>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
        {category.description}
      </p>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>{count != null ? `${count} apps` : "Browse"}</span>
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Card>
  );
}
