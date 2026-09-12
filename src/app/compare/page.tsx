"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { createBrowserClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/db/types"
import { useCompareIds } from "@/hooks/use-compare"
import { computePriceScore, PRICE_SCORE_COPY, type PriceScore } from "@/lib/ai/price-score"
import { Badge } from "@/components/ui/badge"
import { cn } from "cn"

function formatMAD(value: number | null) {
  if (value == null) return "—"
  return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(value) + " DH"
}

export default function ComparePage() {
  const ids = useCompareIds()
  const [listings, setListings] = useState<Tables<"listings">[]>([])
  const [scores, setScores] = useState<Record<string, PriceScore | null>>({})
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
      if (cancelled) return
      const rows = data ?? []
      setListings(rows)

      const entries = await Promise.all(
        rows.map(async (row) => [row.id, await computePriceScore(row)] as const)
      )
      if (!cancelled) {
        setScores(Object.fromEntries(entries))
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [ids])

  const rows: { label: string; render: (listing: Tables<"listings">) => ReactNode }[] = [
    { label: "Price", render: (l) => <span className="font-mono tabular-nums">{formatMAD(l.price)}</span> },
    {
      label: "Price / m²",
      render: (l) => <span className="font-mono tabular-nums">{formatMAD(l.price_per_sqm)}</span>,
    },
    { label: "Surface", render: (l) => (l.surface_m2 ? `${l.surface_m2} m²` : "—") },
    { label: "City", render: (l) => l.city ?? "—" },
    { label: "Neighborhood", render: (l) => l.neighborhood ?? "—" },
    { label: "Property type", render: (l) => <span className="capitalize">{l.property_type ?? "—"}</span> },
    {
      label: "Transaction",
      render: (l) => (l.transaction_type === "rent" ? "For rent" : "For sale"),
    },
    { label: "Rooms", render: (l) => l.rooms ?? "—" },
    { label: "Bedrooms", render: (l) => l.bedrooms ?? "—" },
    {
      label: "Fair-value score",
      render: (l) => {
        const score = scores[l.id]
        if (!score) return "—"
        return <Badge className={cn(PRICE_SCORE_COPY[score.label].className)}>{PRICE_SCORE_COPY[score.label].text}</Badge>
      },
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/listings"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        Back to listings
      </Link>

      <div>
        <h1 className="font-heading text-xl font-semibold">Compare</h1>
        <p className="text-sm text-muted-foreground">Side-by-side comparison of your selected listings.</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : listings.length < 2 ? (
        <p className="text-sm text-muted-foreground">
          Select at least 2 listings from the listings page to compare them.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left text-muted-foreground">&nbsp;</th>
                {listings.map((listing) => (
                  <th key={listing.id} className="min-w-48 p-3 text-left align-top">
                    <Link href={`/listings/${listing.id}`} className="font-medium hover:underline">
                      {listing.title}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b last:border-0">
                  <td className="p-3 text-muted-foreground">{row.label}</td>
                  {listings.map((listing) => (
                    <td key={listing.id} className="p-3">
                      {row.render(listing)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
