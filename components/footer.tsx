import * as React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { siteConfig } from "@/data/site";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/icon";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Casino Apps", href: "/apps" },
      { label: "Reviews", href: "/reviews" },
      { label: "Compare", href: "/compare" },
      { label: "Categories", href: "/categories" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Guides", href: "/guides" },
      { label: "News", href: "/news" },
      { label: "Search", href: "/search" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Responsible Gambling", href: "/responsible-gambling" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="container-tight py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {siteConfig.tagline} Independent reviews of real-money casino and
              gambling apps — licenses verified, payouts tested.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {siteConfig.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon name={s.icon} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 rounded-2xl border border-gold/20 bg-gold/[0.04] p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="rounded-md border border-gold/40 px-2 py-1 font-display text-sm font-bold text-gold">
              18+
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Gambling involves risk. Only bet what you can afford to lose. If it
            stops being fun, take a break. Free, confidential help is available
            via{" "}
            <a
              href="https://www.begambleaware.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-2"
            >
              BeGambleAware
            </a>{" "}
            or GamCare on 0808 8020 133.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All app names, data
            and offers shown are fictional and for demonstration only.
          </p>
          <p>
            Some links are affiliate links marked with <span className="font-medium">#ad</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}
