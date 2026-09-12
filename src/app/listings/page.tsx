import Link from "next/link";
import { LayoutGridIcon, TableIcon, MapIcon } from "lucide-react";

import { createBrowserClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/db/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ListingsFilterBar } from "@/components/listings/listings-filter-bar";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingsMapLoader } from "@/components/listings/listings-map-loader";
import { CompareBar } from "@/components/listings/compare-bar";
import { cn } from "cn";

export const dynamic = "force-dynamic";

function formatMAD(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(value) + " DH";
}

interface ListingsFilters {
  city?: string;
  type?: string;
  transaction?: string;
  view?: string;
}

async function getListings(filters: ListingsFilters): Promise<Tables<"listings">[]> {
  const supabase = createBrowserClient();
  let query = supabase
    .from("listings")
    .select("*")
    .eq("is_active", true)
    .order("scraped_at", { ascending: false })
    .limit(60);

  if (filters.city) query = query.eq("city", filters.city);
  if (filters.type) query = query.eq("property_type", filters.type);
  if (filters.transaction) query = query.eq("transaction_type", filters.transaction);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

function viewToggleHref(filters: ListingsFilters, view: "grid" | "table" | "map") {
  const params = new URLSearchParams();
  if (filters.city) params.set("city", filters.city);
  if (filters.type) params.set("type", filters.type);
  if (filters.transaction) params.set("transaction", filters.transaction);
  if (view !== "grid") params.set("view", view);
  const qs = params.toString();
  return qs ? `/listings?${qs}` : "/listings";
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<ListingsFilters>;
}) {
  const filters = await searchParams;
  const listings = await getListings(filters);
  const view = filters.view === "table" ? "table" : filters.view === "map" ? "map" : "grid";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-heading text-xl font-semibold">Listings</h1>
          <p className="text-sm text-muted-foreground">
            Showing {listings.length} listing{listings.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-1">
          <Link
            href={viewToggleHref(filters, "grid")}
            aria-current={view === "grid"}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs",
              view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGridIcon className="size-3.5" />
            Grid
          </Link>
          <Link
            href={viewToggleHref(filters, "table")}
            aria-current={view === "table"}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs",
              view === "table" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <TableIcon className="size-3.5" />
            Table
          </Link>
          <Link
            href={viewToggleHref(filters, "map")}
            aria-current={view === "map"}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs",
              view === "map" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MapIcon className="size-3.5" />
            Map
          </Link>
        </div>
      </div>

      <ListingsFilterBar />

      {listings.length === 0 ? (
        <p className="text-sm text-muted-foreground">No listings match these filters.</p>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : view === "map" ? (
        <ListingsMapLoader listings={listings} />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Neighborhood</TableHead>
                <TableHead>Surface</TableHead>
                <TableHead>Price / m²</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="max-w-xs truncate font-medium">
                    <Link href={`/listings/${listing.id}`} className="hover:underline">
                      {listing.title}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">{formatMAD(listing.price)}</TableCell>
                  <TableCell>{listing.city ?? "—"}</TableCell>
                  <TableCell>{listing.neighborhood ?? "—"}</TableCell>
                  <TableCell>{listing.surface_m2 ? `${listing.surface_m2} m²` : "—"}</TableCell>
                  <TableCell className="font-mono tabular-nums">{formatMAD(listing.price_per_sqm)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{listing.source}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CompareBar />
    </div>
  );
}
