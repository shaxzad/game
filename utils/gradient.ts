/**
 * Deterministic gradient generator.
 *
 * Turns any string seed into a stable pair of HSL colors, so logos, covers and
 * screenshot mocks look intentional and never change between renders — and
 * need zero network requests.
 */
function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export interface Gradient {
  from: string;
  to: string;
  angle: number;
  hue: number;
}

export function gradientFromSeed(seed: string): Gradient {
  const h = hashSeed(seed);
  const hue = h % 360;
  const hue2 = (hue + 40 + (h % 60)) % 360;
  const angle = h % 360;
  return {
    from: `hsl(${hue} 70% 45%)`,
    to: `hsl(${hue2} 65% 30%)`,
    angle,
    hue,
  };
}

export function gradientCss(seed: string): string {
  const g = gradientFromSeed(seed);
  return `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})`;
}
