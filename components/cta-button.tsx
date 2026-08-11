import * as React from "react";
import { ExternalLink } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CTAButtonProps extends Omit<ButtonProps, "asChild"> {
  href: string;
  children: React.ReactNode;
  /** Show the small 18+ / T&Cs note under the button. */
  disclosure?: boolean;
  external?: boolean;
}

/**
 * Affiliate call-to-action. Opens in a new tab with `rel="sponsored nofollow
 * noopener"` — the correct signals for a monetised outbound link — and can
 * carry an 18+ / T&Cs disclosure line.
 */
export function CTAButton({
  href,
  children,
  disclosure = false,
  external = true,
  variant = "gold",
  size = "lg",
  className,
  ...props
}: CTAButtonProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", disclosure && "items-start")}>
      <Button asChild variant={variant} size={size} className={className} {...props}>
        <a
          href={href}
          {...(external
            ? { target: "_blank", rel: "sponsored nofollow noopener" }
            : {})}
        >
          {children}
          {external && <ExternalLink className="h-4 w-4" />}
        </a>
      </Button>
      {disclosure && (
        <span className="text-[11px] text-muted-foreground">
          18+. Play responsibly. T&amp;Cs apply. #ad
        </span>
      )}
    </div>
  );
}
