import { createBrowserClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/db/types";

export type PriceScoreLabel = "great_deal" | "fair_price" | "overpriced";

export interface PriceScore {
  label: PriceScoreLabel;
  deviationPct: number;
  medianPricePerSqm: number;
  sampleSize: number;
  scope: "neighborhood" | "city";
  sentence: string;
}

const MIN_SAMPLE_SIZE = 5;

function labelFor(deviationPct: number): PriceScoreLabel {
  if (deviationPct <= -10) return "great_deal";
  if (deviationPct >= 10) return "overpriced";
  return "fair_price";
}

export const PRICE_SCORE_COPY: Record<PriceScoreLabel, { text: string; className: string }> = {
  great_deal: { text: "Great deal", className: "border-transparent bg-zellige-green/15 text-zellige-green" },
  fair_price: { text: "Fair price", className: "border-transparent bg-brass/15 text-brass" },
  overpriced: { text: "Overpriced", className: "border-transparent bg-terracotta/15 text-terracotta" },
};

/**
 * Deterministic fair-value score: compares a listing's price/m² to the
 * median for comparable listings. No LLM involved — the math is the score.
 */
export async function computePriceScore(
  listing: Pick<
    Tables<"listings">,
    "city" | "neighborhood" | "property_type" | "transaction_type" | "price_per_sqm"
  >
): Promise<PriceScore | null> {
  if (listing.price_per_sqm == null || !listing.city || !listing.property_type || !listing.transaction_type) {
    return null;
  }

  const supabase = createBrowserClient();

  if (listing.neighborhood) {
    const { data: nbhd } = await supabase
      .from("price_stats")
      .select("median_price_per_sqm, sample_size")
      .eq("city", listing.city)
      .eq("neighborhood", listing.neighborhood)
      .eq("property_type", listing.property_type)
      .eq("transaction_type", listing.transaction_type)
      .maybeSingle();

    if (nbhd && nbhd.sample_size != null && nbhd.sample_size >= MIN_SAMPLE_SIZE && nbhd.median_price_per_sqm != null) {
      return build(listing.price_per_sqm, nbhd.median_price_per_sqm, nbhd.sample_size, "neighborhood", listing);
    }
  }

  const { data: city } = await supabase
    .from("price_stats_city")
    .select("median_price_per_sqm, sample_size")
    .eq("city", listing.city)
    .eq("property_type", listing.property_type)
    .eq("transaction_type", listing.transaction_type)
    .maybeSingle();

  if (city && city.sample_size != null && city.median_price_per_sqm != null) {
    return build(listing.price_per_sqm, city.median_price_per_sqm, city.sample_size, "city", listing);
  }

  return null;
}

function build(
  pricePerSqm: number,
  median: number,
  sampleSize: number,
  scope: "neighborhood" | "city",
  listing: Pick<Tables<"listings">, "city" | "neighborhood" | "property_type" | "transaction_type">
): PriceScore {
  const deviationPct = Math.round(((pricePerSqm - median) / median) * 1000) / 10;
  const label = labelFor(deviationPct);
  const direction = deviationPct < 0 ? "below" : deviationPct > 0 ? "above" : "at";
  const place = scope === "neighborhood" ? `${listing.neighborhood}, ${listing.city}` : listing.city;
  const typeWord = listing.transaction_type === "rent" ? "rentals" : "listings";

  const sentence =
    deviationPct === 0
      ? `This listing is right at the median price for ${listing.property_type} ${typeWord} in ${place} (${sampleSize} comparable listings).`
      : `This listing is ${Math.abs(deviationPct)}% ${direction} the median for ${listing.property_type} ${typeWord} in ${place} (${sampleSize} comparable listings).`;

  return { label, deviationPct, medianPricePerSqm: median, sampleSize, scope, sentence };
}
