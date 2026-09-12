"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LayoutDashboardIcon, ListIcon, HeartIcon, ScaleIcon, SparklesIcon, BuildingIcon } from "lucide-react"

import { createBrowserClient } from "@/lib/supabase/client"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

interface ListingHit {
  id: string
  title: string
  city: string | null
}

const PAGES = [
  { title: "Overview", url: "/", icon: LayoutDashboardIcon },
  { title: "Listings", url: "/listings", icon: ListIcon },
  { title: "Favorites", url: "/favorites", icon: HeartIcon },
  { title: "Compare", url: "/compare", icon: ScaleIcon },
  { title: "Assistant", url: "/assistant", icon: SparklesIcon },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [listings, setListings] = useState<ListingHit[]>([])
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    function onOpenEvent() {
      setOpen(true)
    }
    document.addEventListener("keydown", onKeyDown)
    window.addEventListener("open-command-palette", onOpenEvent)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("open-command-palette", onOpenEvent)
    }
  }, [])

  // Loaded once on mount (this component lives in the root layout) — cheap
  // at this data scale, and avoids re-fetching every time the palette opens.
  useEffect(() => {
    let cancelled = false

    async function load() {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from("listings")
        .select("id, title, city")
        .eq("is_active", true)
        .limit(200);
      if (!cancelled) setListings((data as ListingHit[]) ?? [])
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const go = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Search Daridash" description="Jump to a page or listing">
      <Command>
        <CommandInput placeholder="Search pages or listings…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {PAGES.map((page) => (
              <CommandItem key={page.url} value={page.title} onSelect={() => go(page.url)}>
                <page.icon />
                {page.title}
              </CommandItem>
            ))}
          </CommandGroup>
          {listings.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Listings">
                {listings.map((listing) => (
                  <CommandItem
                    key={listing.id}
                    value={`${listing.title} ${listing.city ?? ""}`}
                    onSelect={() => go(`/listings/${listing.id}`)}
                  >
                    <BuildingIcon />
                    <span className="truncate">{listing.title}</span>
                    {listing.city && <span className="ml-auto text-xs text-muted-foreground">{listing.city}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
