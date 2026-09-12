// Ties each property type to a brand color and gives every listing a stable,
// unique-looking pattern seed derived from its own id — no external images,
// nothing that can 404.

export function colorForPropertyType(propertyType: string | null | undefined): string {
  switch (propertyType) {
    case "apartment":
      return "var(--primary)";
    case "villa":
      return "var(--brass)";
    case "house":
      return "var(--zellige-green)";
    case "land":
      return "var(--terracotta)";
    case "office":
    default:
      return "var(--muted-foreground)";
  }
}

/** FNV-1a string hash — small, deterministic, good enough for a visual seed. */
export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 PRNG — deterministic sequence of [0,1) floats from an integer seed. */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
