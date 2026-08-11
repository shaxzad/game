import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative overflow-hidden">
      <div className="aurora pointer-events-none absolute inset-0" />
      <div className="container-tight relative flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl border border-border bg-card text-primary">
          <Compass className="h-7 w-7" />
        </span>
        <p className="mt-6 font-display text-6xl font-bold tracking-tight text-gradient">404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold">This page busted</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          The page you're after doesn't exist or has moved. Let's get you back to
          the reviews that do.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/">Back home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/apps">Browse apps</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
