import * as React from "react";
import type { Metadata } from "next";
import {
  Wallet,
  Hourglass,
  ShieldOff,
  BellRing,
  Phone,
  ExternalLink,
  LifeBuoy,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = pageMetadata({
  title: "Responsible Gambling",
  description:
    "Gambling should stay fun. Learn the warning signs, the tools that help you stay in control, and where to get free, confidential support.",
  path: "/responsible-gambling",
  keywords: ["responsible gambling", "gambling help", "self-exclusion", "deposit limits"],
});

const warningSigns = [
  "Spending more time or money than you planned, or than you can afford.",
  "Chasing losses — betting more to win back what you've lost.",
  "Borrowing money, selling things, or missing bills to keep playing.",
  "Gambling to escape stress, low mood or boredom.",
  "Feeling restless or irritable when you try to cut back or stop.",
  "Hiding how much you play from people close to you.",
];

const tools = [
  {
    icon: Wallet,
    name: "Deposit & loss limits",
    copy: "Set a daily, weekly or monthly cap on what you can deposit or lose. Decide the number when you're calm, not mid-session.",
  },
  {
    icon: Hourglass,
    name: "Time-outs",
    copy: "Take a short break — 24 hours up to several weeks — that locks you out while you reset.",
  },
  {
    icon: ShieldOff,
    name: "Self-exclusion",
    copy: "Block access for months or years. Multi-operator schemes can exclude you across many sites at once.",
  },
  {
    icon: BellRing,
    name: "Reality checks",
    copy: "On-screen reminders of how long you've played and where you stand, so time doesn't slip away.",
  },
];

const resources = [
  {
    name: "BeGambleAware",
    detail: "Free, confidential advice and a 24/7 National Gambling Helpline.",
    href: "https://www.begambleaware.org",
    action: "begambleaware.org",
  },
  {
    name: "GamCare",
    detail: "Support, information and counselling. Call 0808 8020 133.",
    href: "https://www.gamcare.org.uk",
    action: "0808 8020 133",
  },
  {
    name: "Gambling Therapy",
    detail: "Free online support in multiple languages, worldwide.",
    href: "https://www.gamblingtherapy.org",
    action: "gamblingtherapy.org",
  },
  {
    name: "1-800-GAMBLER (US)",
    detail: "Confidential help across the United States, available 24/7.",
    href: "tel:1-800-426-2537",
    action: "1-800-GAMBLER",
  },
];

export default function ResponsibleGamblingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Play safe"
        title="Responsible gambling"
        description="Gambling is a form of entertainment — never a way to make money or solve a problem. Keeping it that way is what this page is about."
        crumbs={[{ name: "Responsible Gambling", href: "/responsible-gambling" }]}
      />

      <div className="container-tight py-10">
        <div className="mx-auto max-w-3xl">
          <section>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Stay in control
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Most people gamble without harm. But for some it can stop being fun, and it's easier to
              lose track than you'd think. Setting limits before you play, treating losses as the cost of
              the entertainment, and taking regular breaks all help keep it in proportion. If it ever
              stops feeling like a choice, that's the moment to step back and reach out — support is free
              and confidential.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold tracking-tight">Warning signs</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              If a few of these feel familiar, it may be worth pausing and talking to someone.
            </p>
            <ul className="mt-5 space-y-3">
              {warningSigns.map((sign) => (
                <li key={sign} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-14">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-bold tracking-tight">Practical tools</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every licensed app we review offers safer-gambling controls. Use them early — they work
              best as guardrails, not emergency brakes.
            </p>
          </div>
          <div className="mx-auto mt-6 grid max-w-4xl gap-4 sm:grid-cols-2">
            {tools.map((tool) => (
              <Card key={tool.name} className="p-5">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                  <tool.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold tracking-tight">
                  {tool.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{tool.copy}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-4xl">
          <Card className="aurora relative overflow-hidden border-gold/30 bg-gold/[0.06] p-6 sm:p-8">
            <div className="relative">
              <div className="inline-flex items-center gap-2 text-gold">
                <LifeBuoy className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                  Get help now
                </span>
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight">
                Free, confidential support
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                You don't have to wait for things to get bad. These services are free, confidential and
                staffed by people who understand — whether you're worried about your own play or
                someone else's.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {resources.map((r) => {
                  const isTel = r.href.startsWith("tel:");
                  return (
                    <a
                      key={r.name}
                      href={r.href}
                      target={isTel ? undefined : "_blank"}
                      rel={isTel ? undefined : "noopener noreferrer"}
                      className="group flex items-start gap-3 rounded-xl border border-border bg-background/60 p-4 transition-colors hover:border-gold/40"
                    >
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold/10 text-gold">
                        {isTel ? <Phone className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                      </span>
                      <span>
                        <span className="block font-display text-sm font-semibold">{r.name}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                          {r.detail}
                        </span>
                        <span className="mt-1 block text-xs font-medium text-gold">{r.action}</span>
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </Card>
        </section>

        <div className="mx-auto mt-12 max-w-3xl text-center">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            18+ only · Please gamble responsibly
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Gambling is restricted to adults of legal age in your jurisdiction. Never bet more than you
            can afford to lose, and treat any winnings as a bonus rather than an expectation.
          </p>
        </div>
      </div>
    </>
  );
}
