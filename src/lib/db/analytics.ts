import { createBrowserClient } from "@/lib/supabase/client";

export interface AnalyticsRow {
  city: string | null;
  property_type: string | null;
  transaction_type: string | null;
  price: number | null;
  price_per_sqm: number | null;
  surface_m2: number | null;
}

export async function getAnalyticsRows(): Promise<AnalyticsRow[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("listings")
    .select("city, property_type, transaction_type, price, price_per_sqm, surface_m2")
    .eq("is_active", true);

  if (error) throw error;
  return data ?? [];
}

export function avgPricePerSqmByCity(rows: AnalyticsRow[]) {
  const byCity = new Map<string, { sum: number; count: number }>();
  for (const row of rows) {
    if (row.transaction_type !== "sale" || !row.city || row.price_per_sqm == null) continue;
    const entry = byCity.get(row.city) ?? { sum: 0, count: 0 };
    entry.sum += row.price_per_sqm;
    entry.count += 1;
    byCity.set(row.city, entry);
  }
  return [...byCity.entries()]
    .map(([city, { sum, count }]) => ({ city, avgPricePerSqm: Math.round(sum / count) }))
    .sort((a, b) => b.avgPricePerSqm - a.avgPricePerSqm);
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Apartment",
  villa: "Villa",
  house: "House",
  office: "Office",
  land: "Land",
};

export function listingsByPropertyType(rows: AnalyticsRow[]) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const type = row.property_type ?? "unknown";
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }
  const total = rows.length;
  return [...counts.entries()]
    .map(([type, count]) => ({
      key: type,
      label: PROPERTY_TYPE_LABELS[type] ?? type,
      count,
      pct: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function saleVsRentSplit(rows: AnalyticsRow[]) {
  const sale = rows.filter((r) => r.transaction_type === "sale").length;
  const rent = rows.filter((r) => r.transaction_type === "rent").length;
  const total = sale + rent;
  return [
    { key: "sale", label: "For sale", count: sale, pct: total > 0 ? (sale / total) * 100 : 0 },
    { key: "rent", label: "For rent", count: rent, pct: total > 0 ? (rent / total) * 100 : 0 },
  ];
}

export function priceDistribution(rows: AnalyticsRow[]) {
  const prices = rows
    .filter((r) => r.transaction_type === "sale" && r.price != null)
    .map((r) => r.price as number);

  if (prices.length === 0) return [];

  const bucketSize = 500_000; // MAD
  const maxPrice = Math.max(...prices);
  const bucketCount = Math.min(Math.ceil((maxPrice + 1) / bucketSize), 12);

  const buckets = Array.from({ length: bucketCount }, (_, i) => ({
    range: `${(i * bucketSize) / 1_000_000}M–${((i + 1) * bucketSize) / 1_000_000}M`,
    count: 0,
  }));

  for (const price of prices) {
    const idx = Math.min(Math.floor(price / bucketSize), bucketCount - 1);
    buckets[idx].count += 1;
  }

  return buckets;
}

export function analyticsSummary(rows: AnalyticsRow[]) {
  const cities = new Set(rows.map((r) => r.city).filter(Boolean));
  const saleRows = rows.filter((r) => r.transaction_type === "sale" && r.price_per_sqm != null);
  const avgPricePerSqm =
    saleRows.length > 0
      ? Math.round(saleRows.reduce((sum, r) => sum + (r.price_per_sqm ?? 0), 0) / saleRows.length)
      : null;

  return {
    total: rows.length,
    cities: cities.size,
    avgPricePerSqm,
    saleCount: rows.filter((r) => r.transaction_type === "sale").length,
    rentCount: rows.filter((r) => r.transaction_type === "rent").length,
  };
}
