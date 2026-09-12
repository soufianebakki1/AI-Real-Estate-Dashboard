"use client"

import { useEffect, useState } from "react"

import { createBrowserClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/db/types"
import { useFavoriteIds } from "@/hooks/use-favorites"
import { ListingCard } from "@/components/listings/listing-card"

export default function FavoritesPage() {
  const ids = useFavoriteIds()
  const [listings, setListings] = useState<Tables<"listings">[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (ids.length === 0) {
        setListings([])
        setLoading(false)
        return
      }
      setLoading(true)
      const supabase = createBrowserClient()
      const { data } = await supabase.from("listings").select("*").in("id", ids)
      if (!cancelled) {
        setListings(data ?? [])
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [ids])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-xl font-semibold">Favorites</h1>
        <p className="text-sm text-muted-foreground">
          Listings you have saved, kept in this browser.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : listings.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing saved yet — tap the heart on any listing to add it here.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}
