"use client"

import { useEffect } from "react"
import Link from "next/link"
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet"

import type { Tables } from "@/lib/db/types"
import { coordinatesForListing } from "@/lib/design/listing-coordinates"
import { colorForPropertyType } from "@/lib/design/property-colorway"

const MOROCCO_CENTER: [number, number] = [31.7917, -7.0926]

function formatMAD(value: number | null) {
  if (value == null) return "—"
  return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(value) + " DH"
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 13)
    } else {
      map.fitBounds(points, { padding: [40, 40] })
    }
  }, [map, points])

  return null
}

interface Pin {
  listing: Tables<"listings">
  coords: [number, number]
}

export function ListingsMap({ listings }: { listings: Tables<"listings">[] }) {
  const pins: Pin[] = listings
    .map((listing) => {
      const coords = coordinatesForListing(listing)
      return coords ? { listing, coords } : null
    })
    .filter((p): p is Pin => p !== null)

  return (
    <div className="flex flex-col gap-2">
      <div className="h-[520px] w-full overflow-hidden rounded-lg border">
        <MapContainer
          center={pins[0]?.coords ?? MOROCCO_CENTER}
          zoom={6}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution="Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS user community"
          />
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}" />
          <FitBounds points={pins.map((p) => p.coords)} />
          {pins.map(({ listing, coords }) => {
            const color = colorForPropertyType(listing.property_type)
            return (
              <CircleMarker
                key={listing.id}
                center={coords}
                radius={7}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 1.5 }}
              >
                <Popup>
                  <div className="flex flex-col gap-1 text-sm">
                    <Link href={`/listings/${listing.id}`} className="font-medium hover:underline">
                      {listing.title}
                    </Link>
                    <span className="font-mono tabular-nums">{formatMAD(listing.price)}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {listing.property_type} · {listing.neighborhood ?? listing.city}
                    </span>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        Approximate neighborhood locations — not real addresses.
      </p>
    </div>
  )
}
