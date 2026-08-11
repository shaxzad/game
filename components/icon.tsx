import * as React from "react";
import {
  Dices,
  Video,
  Trophy,
  Diamond,
  Shuffle,
  Orbit,
  Zap,
  Target,
  Twitter,
  Youtube,
  MessageCircle,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

/**
 * Resolves the icon-name strings stored in the data layer (category.icon,
 * social.icon) to Lucide components, so the JSON stays free of imports and a
 * future Strapi payload can carry the same string keys unchanged.
 */
const registry: Record<string, LucideIcon> = {
  Dices,
  Video,
  Trophy,
  Diamond,
  Shuffle,
  Orbit,
  Zap,
  Target,
  Twitter,
  Youtube,
  MessageCircle,
};

export function Icon({
  name,
  className,
  ...props
}: { name: string } & React.ComponentProps<LucideIcon>) {
  const Cmp = registry[name] ?? HelpCircle;
  return <Cmp className={className} {...props} />;
}
