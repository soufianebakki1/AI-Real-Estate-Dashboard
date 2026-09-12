import { hashSeed } from "./property-colorway"

// Curated, verified Unsplash photos per property type — placeholder imagery for
// synthetic demo listings (no real photos exist for them). Hotlinked directly
// from images.unsplash.com, no API key needed.
export const UNSPLASH_PHOTOS: Record<string, string[]> = {
  apartment: [
    "https://images.unsplash.com/photo-1758448755856-01d3add0177b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1749930206000-179d0b85aa7e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1761535315385-219131cb53e6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1750764484555-58d055fdd2c7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1737898415581-7dea57a1905b?auto=format&fit=crop&w=800&q=80",
  ],
  villa: [
    "https://images.unsplash.com/photo-1682502524896-6d78b9e8413a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1706164971293-2d58eb66242b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1706164971299-cfa23ec76083?auto=format&fit=crop&w=800&q=80",
  ],
  house: [
    "https://images.unsplash.com/photo-1751965681076-54dcff5a9f2a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1757009400308-d0baf3f4ece9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1760727752323-7023aca96d34?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1760727752214-b697969dbead?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1752052029345-6f494e314b05?auto=format&fit=crop&w=800&q=80",
  ],
  office: [
    "https://images.unsplash.com/photo-1757954694963-ea693d2cb1dc?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1776914579657-3396d13eb13e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1770979977268-dcd41c26b2bb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1756305930319-10ec177ec0a9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1745015446589-7ee6f702d8c1?auto=format&fit=crop&w=800&q=80",
  ],
  land: [
    "https://images.unsplash.com/photo-1720986316247-1177c8058103?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1582742850838-24590fb39fdc?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1628116904346-44a605db3b6e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1727640567926-e6412ca72e4b?auto=format&fit=crop&w=800&q=80",
  ],
}

/** Deterministic per-listing photo so the same listing always shows the same image. */
export function imageForListing(id: string, propertyType: string | null | undefined): string | null {
  const key = propertyType && UNSPLASH_PHOTOS[propertyType]?.length ? propertyType : "apartment"
  const photos = UNSPLASH_PHOTOS[key]
  if (!photos || photos.length === 0) return null
  const idx = hashSeed(id) % photos.length
  return photos[idx];
}
