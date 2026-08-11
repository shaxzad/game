import * as React from "react";
import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";
import { cn } from "@/lib/utils";

/**
 * Standard masthead for interior/listing pages: breadcrumbs, an eyebrow, a
 * title and an optional description, over the vault aurora.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
  children,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  crumbs?: Crumb[];
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("relative overflow-hidden border-b border-border", className)}>
      <div className="aurora pointer-events-none absolute inset-0 opacity-70" />
      <div className="container-tight relative py-10 sm:py-14">
        {crumbs && <Breadcrumbs items={crumbs} className="mb-5" />}
        {eyebrow && (
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <span className="h-1 w-1 rounded-full bg-primary" />
            {eyebrow}
          </div>
        )}
        <h1 className="max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </header>
  );
}
