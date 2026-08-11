"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Search entry point. Submits to /search?q=…; the results page owns the actual
 * querying so this stays a thin, reusable control (navbar + search page + hero).
 */
export function SearchBar({
  defaultValue = "",
  placeholder = "Search apps, reviews, guides…",
  autoFocus = false,
  className,
  size = "default",
}: {
  defaultValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  size?: "default" | "lg";
}) {
  const router = useRouter();
  const [value, setValue] = React.useState(defaultValue);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <form role="search" onSubmit={onSubmit} className={cn("relative w-full", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        name="q"
        aria-label="Search"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn("pl-10", size === "lg" && "h-12 rounded-2xl text-base")}
      />
    </form>
  );
}
