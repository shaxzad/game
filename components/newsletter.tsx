"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Newsletter opt-in with client-side email validation. No backend yet — on
 * success it fires a toast; wire the `onSubscribe` to an API route later.
 */
export function Newsletter({
  variant = "panel",
  className,
}: {
  variant?: "panel" | "inline";
  className?: string;
}) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setEmail("");
    toast.success("You're on the list", {
      description: "We'll send the weekly rundown — new reviews, bonuses and payout news.",
    });
  }

  return (
    <div
      className={cn(
        variant === "panel" &&
          "aurora relative overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-10",
        className
      )}
    >
      {variant === "panel" && (
        <div className="mb-6 max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Mail className="h-3.5 w-3.5 text-primary" />
            The AceVault weekly
          </div>
          <h3 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            New reviews and bonuses, once a week
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            No spam, no pressure. Just the apps worth your time and the offers worth taking. Unsubscribe anytime.
          </p>
        </div>
      )}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <Input
            id="newsletter-email"
            type="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "newsletter-error" : undefined}
            className="h-11"
          />
        </div>
        <Button type="submit" size="lg" className="shrink-0">
          Subscribe
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
      {error && (
        <p id="newsletter-error" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
