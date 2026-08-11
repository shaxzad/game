import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  name: "AceVault",
  domain: "acevault.example",
  url: "https://acevault.example",
  tagline: "Casino apps, reviewed like fintech.",
  description:
    "AceVault reviews and compares real-money casino and gambling apps — verified licenses, trust scores, payout speeds and bonuses, tested hands-on so you never download blind.",
  email: "hello@acevault.example",
  social: [
    { label: "X", href: "https://x.com", icon: "Twitter" },
    { label: "YouTube", href: "https://youtube.com", icon: "Youtube" },
    { label: "Reddit", href: "https://reddit.com", icon: "MessageCircle" },
  ],
  nav: [
    { label: "Casino Apps", href: "/apps" },
    { label: "Reviews", href: "/reviews" },
    { label: "Compare", href: "/compare" },
    { label: "Guides", href: "/guides" },
    { label: "News", href: "/news" },
    { label: "Categories", href: "/categories" },
  ],
};
