export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Randomized delay between requests so we don't hammer the source site. */
export async function politeDelay(minMs = 1000, maxMs = 3000): Promise<void> {
  const ms = minMs + Math.random() * (maxMs - minMs);
  await sleep(ms);
}

// Kept as a plain, real-looking browser UA (no custom suffix) since several
// Moroccan listing sites sit behind AWS WAF Bot Control, which rejects
// anything that deviates from a standard browser UA string.
export const SCRAPER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
