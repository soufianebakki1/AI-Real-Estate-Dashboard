"use client"

import dynamic from "next/dynamic"

import type { Tables } from "@/lib/db/types"

// Leaflet touches `window` at import time, so it can only ever run client-side.
// `ssr: false` is only valid from within a Client Component boundary — hence
// this thin wrapper around the real map component.
const ListingsMap = dynamic(() => import("./listings-map").then((m) => m.ListingsMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] w-full items-center justify-center rounded-lg border text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
})

export function ListingsMapLoader({ listings }: { listings: Tables<"listings">[] }) {
  return <ListingsMap listings={listings} />
}
