import * as React from "react";
import type { Metadata } from "next";
import { Mail, MessageSquare, Info } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/components/contact-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with the AceVault team — corrections, questions, partnership enquiries or feedback on a review.",
  path: "/contact",
  keywords: ["contact acevault", "casino review feedback"],
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Say hello"
        title="Contact us"
        description="Spotted something we got wrong, or want to reach the team? Send us a note — we read every message."
        crumbs={[{ name: "Contact", href: "/contact" }]}
      />

      <div className="container-tight py-10">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <Card className="p-6 sm:p-8">
            <ContactForm />
          </Card>

          <aside className="space-y-4">
            <Card className="p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                <Mail className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-display text-base font-semibold tracking-tight">
                Email us
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Prefer email? Reach the team directly.
              </p>
              <a
                href="mailto:hello@acevault.example"
                className="mt-3 inline-block text-sm font-medium text-primary hover:text-primary/80"
              >
                hello@acevault.example
              </a>
            </Card>

            <Card className="p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gold/10 text-gold ring-1 ring-inset ring-gold/20">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-display text-base font-semibold tracking-tight">
                Corrections &amp; tips
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                If a review is out of date or you've got a story lead, tell us in the subject line and
                we'll prioritise it.
              </p>
            </Card>

            <Card className="glass flex gap-3 p-5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                This is a demo site. The form doesn't send a real message and the address above is a
                placeholder for illustration only.
              </p>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}
