import * as React from "react";
import { cn } from "@/lib/utils";
import { countryFlag, countryName } from "@/utils/countries";
import type { LicenseAuthority, PaymentMethod, Platform } from "@/types";

const base =
  "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground";

export function Chip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn(base, className)}>{children}</span>;
}

export function PaymentChip({ method }: { method: PaymentMethod }) {
  return <Chip>{method}</Chip>;
}

export function PlatformChip({ platform }: { platform: Platform }) {
  return <Chip className="text-foreground/80">{platform}</Chip>;
}

export function LicenseChip({ authority }: { authority: LicenseAuthority }) {
  return (
    <Chip className="border-primary/25 bg-primary/10 text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      {authority}
    </Chip>
  );
}

export function CountryChip({ code }: { code: string }) {
  return (
    <Chip>
      <span aria-hidden>{countryFlag(code)}</span>
      {countryName(code)}
    </Chip>
  );
}
