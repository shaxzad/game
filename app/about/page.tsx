import * as React from "react";
import type { Metadata } from "next";
import {
  Dice5,
  Gift,
  Timer,
  MousePointerClick,
  LifeBuoy,
  ShieldCheck,
  Scale,
  Handshake,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Who we are, how we make money and the five-pillar methodology behind every AceVault score — reviewed like fintech, independent by design.",
  path: "/about",
  keywords: ["about acevault", "casino review methodology", "affiliate disclosure"],
});

const pillars = [
  {
    icon: Dice5,
    name: "Game variety",
    copy: "Breadth and quality of the library — slots, live dealer, table games and the studios behind them.",
  },
  {
    icon: Gift,
    name: "Bonuses",
    copy: "Real value of welcome offers and promos once you read the wagering, caps and expiry — not just the headline number.",
  },
  {
    icon: Timer,
    name: "Payout speed",
    copy: "How fast verified withdrawals actually land, timed across the payment methods each app supports.",
  },
  {
    icon: MousePointerClick,
    name: "Usability",
    copy: "Sign-up, navigation and everyday play on real devices — how the app feels when you're not thinking about it.",
  },
  {
    icon: LifeBuoy,
    name: "Support",
    copy: "Responsiveness and usefulness of help channels, plus the strength of responsible-play tools.",
  },
];

const stats = [
  { value: "20+", label: "Apps reviewed" },
  { value: "5", label: "Scoring pillars" },
  { value: "100%", label: "Licenses verified" },
  { value: "0", label: "Paid placements" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our approach"
        title="Casino apps, reviewed like fintech"
        description="AceVault treats a casino app the way you'd scrutinise a banking app — because that's exactly what it is once your money is inside it."
        crumbs={[{ name: "About", href: "/about" }]}
      />

      <div className="container-tight py-10">
        <div className="mx-auto max-w-3xl">
          <section>
            <h2 className="font-display text-2xl font-bold tracking-tight">Our mission</h2>
            <p className="mt-4 text-lg leading-relaxed text-foreground/90">
              Downloading a real-money app shouldn't feel like a gamble in itself. We exist so you never
              have to install one blind.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Every app in our index is checked against its licence, tested hands-on and timed on the
              things that actually cost or save you money — payout speed, bonus terms and the fine print
              most sites skip. We write it up in plain English, with the trade-offs stated, so you can
              decide for yourself.
            </p>
          </section>

          <div className="my-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-5 text-center">
                <div className="font-display text-3xl font-bold tabular-nums text-primary">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>

          <section className="mt-12">
            <div className="mb-3 inline-flex items-center gap-2 text-primary">
              <Handshake className="h-5 w-5" />
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                How we make money
              </h2>
            </div>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              AceVault is free to read because some of the outbound links to operators are affiliate
              links. If you sign up through one, we may earn a commission — at no extra cost to you.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Here's the line we won't cross: affiliate relationships never influence a score, a ranking
              or a verdict. We rate apps we earn nothing from, we publish the flaws of apps we do, and no
              operator can pay for placement, a better rating or a nicer review. The scoring happens
              first; the commercial arrangement, if any, comes after.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Our five-pillar methodology
            </h2>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              Every rating is built from the same five pillars, weighted and combined into one trust
              score out of 100. No single flashy feature can carry an app — it has to hold up across all
              of them.
            </p>
          </section>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.name} className="p-5">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                <pillar.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold tracking-tight">
                {pillar.name}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{pillar.copy}</p>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <Card className="glass p-6 sm:p-8">
            <div className="mb-3 inline-flex items-center gap-2 text-primary">
              <ShieldCheck className="h-5 w-5" />
              <Scale className="h-5 w-5" />
            </div>
            <h2 className="font-display text-xl font-bold tracking-tight">Editorial independence</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Our editors have full and final say over what we publish. Ratings are set by the
              methodology above and reviewed by a second editor — never by a commercial team, and never
              by an operator. When an app improves, its score goes up; when it slips, the score follows,
              even if that's inconvenient for us. If we ever get something wrong, we correct it in the
              open and note what changed.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
