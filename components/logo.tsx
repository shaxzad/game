import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * AceVault wordmark. A compact vault-door "A" glyph in a seeded emerald tile
 * plus the wordmark; used in the navbar and footer.
 */
export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="AceVault home"
    >
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-emerald-800 ring-1 ring-inset ring-white/10 transition-transform group-hover:scale-105">
        <span className="absolute inset-[3px] rounded-lg border border-dashed border-gold/50" />
        <span className="font-display text-lg font-bold text-white">A</span>
      </span>
      {showText && (
        <span className="font-display text-lg font-semibold tracking-tight">
          Ace<span className="text-gradient">Vault</span>
        </span>
      )}
    </Link>
  );
}
