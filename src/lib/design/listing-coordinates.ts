import { hashSeed, mulberry32 } from "./property-colorway"

// Real city centers. Neighborhood/listing positions are synthetic — there are
// no real addresses for this seeded data — so they're deterministically
// scattered around the city center instead of geocoded.
export const CITY_CENTERS: Record<string, [number, number]> = {
  Casablanca: [33.5731, -7.5898],
  Rabat: [34.0209, -6.8416],
  Marrakech: [31.6295, -7.9811],
  Tanger: [35.7595, -5.834],
  Agadir: [30.4278, -9.5981],
  "Fès": [34.0181, -5.0078],
};

const KM_PER_DEG_LAT = 111;
const KM_PER_DEG_LNG = 96; // approx at Morocco's ~30-36°N latitude band

function offsetFromSeed(seed: number, minKm: number, maxKm: number): [number, number] {
  const rand = mulberry32(seed);
  const angle = rand() * Math.PI * 2;
  const distance = minKm + rand() * (maxKm - minKm);
  const dLat = (Math.sin(angle) * distance) / KM_PER_DEG_LAT;
  const dLng = (Math.cos(angle) * distance) / KM_PER_DEG_LNG;
  return [dLat, dLng];
}

/** Deterministic, approximate coordinates: city center + a per-neighborhood cluster offset + small per-listing jitter. */
export function coordinatesForListing(listing: {
  id: string;
  city: string | null;
  neighborhood: string | null;
}): [number, number] | null {
  if (!listing.city) return null;
  const center = CITY_CENTERS[listing.city];
  if (!center) return null;

  const [nLat, nLng] = listing.neighborhood
    ? offsetFromSeed(hashSeed(`${listing.city}:${listing.neighborhood}`), 1, 4)
    : [0, 0];

  const [jLat, jLng] = offsetFromSeed(hashSeed(`jitter:${listing.id}`), 0, 0.5);

  return [center[0] + nLat + jLat, center[1] + nLng + jLng];
}
