import { mubawabAdapter, closeMubawabBrowser } from "../scrapers/mubawab";
import type { ScraperAdapter, Source, TransactionType } from "../scrapers/core/types";
import { buildDedupKey } from "../scrapers/core/normalize";
import { politeDelay } from "../scrapers/core/rate-limit";
import { createServiceClient } from "../lib/supabase/server";
import type { Json } from "../lib/db/types";

try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local may already be loaded by the shell; ignore if missing.
}

const ADAPTERS: Partial<Record<Source, ScraperAdapter>> = {
  mubawab: mubawabAdapter,
};

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string, fallback?: string) => {
    const prefix = `--${flag}=`;
    const match = args.find((a) => a.startsWith(prefix));
    return match ? match.slice(prefix.length) : fallback;
  };

  const source = (get("source", "mubawab") as Source) ?? "mubawab";
  const city = get("city", "casablanca")!;
  const transactionType = (get("transaction", "sale") as TransactionType) ?? "sale";
  const maxPages = Number(get("pages", "3"));

  return { source, city, transactionType, maxPages };
}

async function main() {
  const { source, city, transactionType, maxPages } = parseArgs();
  const adapter = ADAPTERS[source];
  if (!adapter) {
    console.error(`No scraper adapter implemented for source "${source}" yet.`);
    process.exit(1);
  }

  const supabase = createServiceClient();

  const { data: run, error: runError } = await supabase
    .from("scrape_runs")
    .insert({ source, params: { city, transactionType, maxPages } })
    .select()
    .single();

  if (runError || !run) {
    console.error("Failed to create scrape_runs row:", runError);
    process.exit(1);
  }

  let found = 0;
  let inserted = 0;
  let updated = 0;
  let errorMessage: string | undefined;

  try {
    console.log(`[scrape] ${source}: listing URLs for ${city} (${transactionType}), up to ${maxPages} pages...`);
    const urls = await adapter.fetchListingUrls({ city, transactionType, maxPages });
    found = urls.length;
    console.log(`[scrape] ${source}: found ${found} listing URLs`);

    for (const [i, url] of urls.entries()) {
      console.log(`[scrape] ${source}: (${i + 1}/${found}) ${url}`);
      const listing = await adapter.fetchListingDetail(url);
      await politeDelay();

      if (!listing) continue;

      const dedupKey = buildDedupKey(source, listing.sourceId ?? listing.url);
      const { error: upsertError, data: upserted } = await supabase
        .from("listings")
        .upsert(
          {
            source: listing.source,
            source_id: listing.sourceId,
            url: listing.url,
            dedup_key: dedupKey,
            title: listing.title,
            description: listing.description,
            price: listing.price,
            currency: listing.currency ?? "MAD",
            surface_m2: listing.surfaceM2,
            city: listing.city,
            neighborhood: listing.neighborhood,
            rooms: listing.rooms,
            bedrooms: listing.bedrooms,
            property_type: listing.propertyType,
            transaction_type: listing.transactionType,
            raw_json: listing.raw as Json,
            scraped_at: new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: "dedup_key" }
        )
        .select("id, created_at, updated_at");

      if (upsertError) {
        console.error(`[scrape] failed to upsert ${url}:`, upsertError.message);
        continue;
      }

      const row = upserted?.[0];
      if (row && row.created_at === row.updated_at) inserted++;
      else updated++;
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[scrape] run failed:", errorMessage);
  } finally {
    await closeMubawabBrowser();
  }

  await supabase
    .from("scrape_runs")
    .update({
      finished_at: new Date().toISOString(),
      status: errorMessage ? "failed" : "success",
      listings_found: found,
      listings_inserted: inserted,
      listings_updated: updated,
      error_message: errorMessage,
    })
    .eq("id", run.id);

  console.log(`[scrape] done: found=${found} inserted=${inserted} updated=${updated}`);
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
