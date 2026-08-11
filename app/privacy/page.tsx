import * as React from "react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How AceVault collects, uses and protects your information — including cookies, analytics, affiliate tracking and your data rights.",
  path: "/privacy",
  keywords: ["privacy policy", "cookies", "data rights", "affiliate tracking"],
});

const LAST_UPDATED = "August 1, 2026";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy policy"
        description={`How we handle your information at AceVault. Last updated ${LAST_UPDATED}.`}
        crumbs={[{ name: "Privacy Policy", href: "/privacy" }]}
      />

      <div className="container-tight py-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Last updated:</span> {LAST_UPDATED}
          </p>

          <div className="mt-8">
            <Section title="Introduction">
              <p>
                This policy explains what information AceVault collects when you use our website, why we
                collect it, and the choices you have. AceVault is an editorial site that reviews and
                compares casino apps; we are not a gambling operator and you cannot place bets with us.
                By using the site you agree to the practices described here.
              </p>
            </Section>

            <Section title="Information we collect">
              <p>
                We aim to collect as little as possible. Depending on how you use the site, this may
                include:
              </p>
              <ul className="ml-5 list-disc space-y-1.5">
                <li>
                  Information you give us directly — for example, your name, email address and message
                  when you use the contact form or subscribe to our newsletter.
                </li>
                <li>
                  Technical and usage data collected automatically — such as your IP address, browser
                  type, device, referring pages and which pages you view.
                </li>
              </ul>
              <p>
                We do not ask for, or knowingly store, sensitive financial details or gambling-account
                credentials.
              </p>
            </Section>

            <Section title="Cookies & analytics">
              <p>
                We use cookies and similar technologies to keep the site working, remember preferences
                (like your theme), and understand how the site is used so we can improve it. Analytics
                cookies help us measure aggregate, non-identifying trends such as popular pages and
                traffic sources.
              </p>
              <p>
                You can control or delete cookies through your browser settings. Blocking some cookies
                may affect how parts of the site behave.
              </p>
            </Section>

            <Section title="Affiliate links & how tracking works">
              <p>
                Many outbound links to operators are affiliate links. When you click one, the operator or
                an affiliate network may set a cookie or append a tracking identifier to the URL so that
                any resulting sign-up is credited to us. This lets us earn a commission at no extra cost
                to you.
              </p>
              <p>
                That tracking is handled by the operator and network, not by AceVault, and is governed by
                their own privacy policies. Affiliate relationships never influence our ratings, rankings
                or editorial verdicts.
              </p>
            </Section>

            <Section title="Third parties">
              <p>
                We share data with service providers who help us run the site — for example, hosting,
                email delivery and analytics providers — only to the extent needed to perform those
                services. We may also disclose information where required by law. We do not sell your
                personal information.
              </p>
            </Section>

            <Section title="Data retention">
              <p>
                We keep personal information only for as long as necessary for the purpose it was
                collected — for instance, newsletter data until you unsubscribe, and contact messages for
                a reasonable period to handle your enquiry. Aggregated analytics data may be retained
                longer in a form that does not identify you.
              </p>
            </Section>

            <Section title="Your rights">
              <p>
                Depending on where you live, you may have rights under laws such as the EU/UK GDPR and the
                California Consumer Privacy Act (CCPA). These can include the right to access, correct,
                delete or port your data, to object to or restrict certain processing, and to withdraw
                consent. To exercise any of these, contact us using the details below and we'll respond in
                line with applicable law.
              </p>
            </Section>

            <Section title="Children">
              <p>
                AceVault is intended for adults only. Gambling-related content is strictly 18+ (or the
                legal age in your jurisdiction). We do not knowingly collect information from anyone under
                18. If you believe a minor has provided us with personal data, contact us and we will
                remove it.
              </p>
            </Section>

            <Section title="Changes to this policy">
              <p>
                We may update this policy from time to time to reflect changes in our practices or the
                law. When we do, we'll revise the "Last updated" date at the top. Significant changes may
                be highlighted on the site.
              </p>
            </Section>

            <Section title="Contact">
              <p>
                Questions about this policy or your data? Email us at{" "}
                <a
                  href="mailto:hello@acevault.example"
                  className="font-medium text-primary hover:text-primary/80"
                >
                  hello@acevault.example
                </a>
                .
              </p>
              <p className="text-sm">
                Note: AceVault is a demo project. This policy is provided for illustration and is not
                legal advice.
              </p>
            </Section>
          </div>
        </div>
      </div>
    </>
  );
}
