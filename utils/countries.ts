/**
 * Minimal ISO 3166-1 alpha-2 → name + emoji flag map for the countries used
 * in the mock dataset. In production this can come from a fuller i18n source.
 */
const COUNTRIES: Record<string, string> = {
  US: "United States",
  CA: "Canada",
  GB: "United Kingdom",
  IE: "Ireland",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
  NL: "Netherlands",
  SE: "Sweden",
  NO: "Norway",
  FI: "Finland",
  PT: "Portugal",
  AT: "Austria",
  CH: "Switzerland",
  PL: "Poland",
  AU: "Australia",
  NZ: "New Zealand",
  JP: "Japan",
  BR: "Brazil",
  MX: "Mexico",
  AR: "Argentina",
  ZA: "South Africa",
  IN: "India",
  AE: "United Arab Emirates",
  MT: "Malta",
  DK: "Denmark",
  BE: "Belgium",
};

export function countryName(code: string): string {
  return COUNTRIES[code] ?? code;
}

/** Convert an ISO alpha-2 code to its regional-indicator emoji flag. */
export function countryFlag(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "🏳️";
  const base = 0x1f1e6;
  const chars = code
    .toUpperCase()
    .split("")
    .map((c) => base + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...chars);
}

export function countryList(codes: string[]): { code: string; name: string; flag: string }[] {
  return codes.map((code) => ({
    code,
    name: countryName(code),
    flag: countryFlag(code),
  }));
}
