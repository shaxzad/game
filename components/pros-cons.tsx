import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Two-column pros & cons panel for review pages.
 */
export function ProsCons({
  pros,
  cons,
  className,
}: {
  pros: string[];
  cons: string[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
        <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-emerald-500">
          <Check className="h-4 w-4" />
          Pros
        </h3>
        <ul className="space-y-2.5">
          {pros.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-5">
        <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-rose-500">
          <X className="h-4 w-4" />
          Cons
        </h3>
        <ul className="space-y-2.5">
          {cons.map((c) => (
            <li key={c} className="flex items-start gap-2.5 text-sm">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
