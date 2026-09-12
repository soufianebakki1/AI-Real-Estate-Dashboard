import { createHash } from "node:crypto";
import type { Source } from "./types";

const CITY_ALIASES: Record<string, string> = {
  casa: "Casablanca",
  "casa blanca": "Casablanca",
  rbat: "Rabat",
};

export function normalizeCity(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  const key = trimmed.toLowerCase();
  return CITY_ALIASES[key] ?? trimmed;
}

/** "719 000 DH" -> 719000. Returns undefined if no digits found. */
export function parsePriceMAD(raw: string | undefined | null): number | undefined {
  if (!raw) return undefined;
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return undefined;
  return Number(digits);
}

/** "47m²" / "224 m²" -> 47 / 224 */
export function parseSurfaceM2(raw: string | undefined | null): number | undefined {
  if (!raw) return undefined;
  const match = raw.replace(/\s/g, "").match(/(\d+(?:[.,]\d+)?)m²?/i);
  if (!match) return undefined;
  return Number(match[1].replace(",", "."));
}

/** "2 Pièces" / "3 Chambres" -> 2 / 3 */
export function parseLeadingInt(raw: string | undefined | null): number | undefined {
  if (!raw) return undefined;
  const match = raw.trim().match(/^(\d+)/);
  if (!match) return undefined;
  return Number(match[1]);
}

const PROPERTY_TYPE_KEYWORDS: Array<[RegExp, string]> = [
  [/appartement/i, "apartment"],
  [/villa/i, "villa"],
  [/maison/i, "house"],
  [/riad/i, "house"],
  [/duplex/i, "apartment"],
  [/studio/i, "apartment"],
  [/bureau|plateau/i, "office"],
  [/local commercial|magasin/i, "office"],
  [/terrain|lot/i, "land"],
];

export function inferPropertyType(title: string): string | undefined {
  for (const [pattern, type] of PROPERTY_TYPE_KEYWORDS) {
    if (pattern.test(title)) return type;
  }
  return undefined;
}

/** Splits Mubawab's "Hay Hassani, Casablanca" location string into neighborhood + city. */
export function splitLocation(raw: string | undefined | null): {
  neighborhood?: string;
  city?: string;
} {
  if (!raw) return {};
  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { city: normalizeCity(parts[0]) };
  const city = normalizeCity(parts[parts.length - 1]);
  const neighborhood = parts.slice(0, -1).join(", ");
  return { neighborhood, city };
}

export function buildDedupKey(source: Source, sourceIdOrUrl: string): string {
  return createHash("sha256").update(`${source}:${sourceIdOrUrl}`).digest("hex");
}
