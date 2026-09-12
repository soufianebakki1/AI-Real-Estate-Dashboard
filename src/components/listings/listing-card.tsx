import Link from "next/link"

import type { Tables } from "@/lib/db/types"
import { colorForPropertyType } from "@/lib/design/property-colorway"
import { imageForListing } from "@/lib/design/listing-image"
import { ZelligePattern } from "@/components/branding/zellige-pattern"
import { ZelligeMark } from "@/components/branding/zellige-mark"
import { Badge } from "@/components/ui/badge"
import { FavoriteButton } from "@/components/listings/favorite-button"
import { CompareToggleChip } from "@/components/listings/compare-toggle-chip"

function formatMAD(value: number | null) {
  if (value == null) return "—"
  return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(value) + " DH"
}

export function ListingCard({ listing }: { listing: Tables<"listings"> }) {
  const color = colorForPropertyType(listing.property_type)
  const photo = imageForListing(listing.id, listing.property_type)

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="" loading="lazy" className="h-full w-full object-cover" />
            <div className="absolute right-2 bottom-2 flex size-6 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-sm">
              <ZelligeMark className="size-3" />
            </div>
          </>
        ) : (
          <ZelligePattern seed={listing.id} color={color} cols={5} rows={4} className="h-full w-full" />
        )}
        <div className="absolute top-2 left-2">
          <Badge variant="outline" className="border-none bg-background/80 backdrop-blur-sm">
            {listing.transaction_type === "rent" ? "For rent" : "For sale"}
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          <FavoriteButton id={listing.id} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="font-mono text-lg font-medium tabular-nums">{formatMAD(listing.price)}</div>
        <div className="truncate text-sm font-medium">{listing.title}</div>
        <div className="truncate text-xs text-muted-foreground">
          {listing.neighborhood ? `${listing.neighborhood}, ` : ""}
          {listing.city ?? "Unknown city"}
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize">{listing.property_type ?? "—"}</span>
            {listing.surface_m2 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{listing.surface_m2} m²</span>
              </>
            )}
          </div>
          <CompareToggleChip id={listing.id} />
        </div>
      </div>
    </Link>
  )
}
