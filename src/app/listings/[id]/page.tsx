import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { createBrowserClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/db/types";
import { computePriceScore, PRICE_SCORE_COPY } from "@/lib/ai/price-score";
import { colorForPropertyType } from "@/lib/design/property-colorway";
import { imageForListing } from "@/lib/design/listing-image";
import { ZelligePattern } from "@/components/branding/zellige-pattern";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { ListingCard } from "@/components/listings/listing-card";
import { cn } from "cn";

export const dynamic = "force-dynamic";

function formatMAD(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(value) + " DH";
}

async function getListing(id: string): Promise<Tables<"listings"> | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

async function getSimilarListings(listing: Tables<"listings">): Promise<Tables<"listings">[]> {
  if (!listing.city || !listing.property_type) return [];
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("is_active", true)
    .eq("city", listing.city)
    .eq("property_type", listing.property_type)
    .neq("id", listing.id)
    .limit(20);
  if (error || !data) return [];

  const withPrice = data.filter((l) => l.price != null);
  withPrice.sort((a, b) => Math.abs((a.price ?? 0) - (listing.price ?? 0)) - Math.abs((b.price ?? 0) - (listing.price ?? 0)));
  return withPrice.slice(0, 4);
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const [score, similar] = await Promise.all([computePriceScore(listing), getSimilarListings(listing)]);
  const color = colorForPropertyType(listing.property_type);
  const photo = imageForListing(listing.id, listing.property_type);

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/listings"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        Back to listings
      </Link>

      <div className="relative aspect-[3/1] overflow-hidden rounded-xl border">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <ZelligePattern seed={listing.id} color={color} cols={16} rows={5} className="h-full w-full" />
        )}
        <div className="absolute top-3 right-3">
          <FavoriteButton id={listing.id} />
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-heading text-xl font-semibold">{listing.title}</h1>
          <p className="text-sm text-muted-foreground">
            {listing.neighborhood ? `${listing.neighborhood}, ` : ""}
            {listing.city ?? "Unknown city"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{listing.source}</Badge>
          <Badge variant="outline">{listing.transaction_type === "rent" ? "For rent" : "For sale"}</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Price</CardDescription>
            <CardTitle className="font-mono text-2xl tabular-nums">{formatMAD(listing.price)}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Surface</CardDescription>
            <CardTitle className="font-mono text-2xl tabular-nums">
              {listing.surface_m2 ? `${listing.surface_m2} m²` : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Price / m²</CardDescription>
            <CardTitle className="font-mono text-2xl tabular-nums">{formatMAD(listing.price_per_sqm)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Fair-value score</CardTitle>
            {score && (
              <Badge className={cn(PRICE_SCORE_COPY[score.label].className)}>
                {PRICE_SCORE_COPY[score.label].text}
              </Badge>
            )}
          </div>
          <CardDescription>
            {score
              ? score.sentence
              : "Not enough comparable listings in this area yet to compute a score."}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          <div>
            <div className="text-muted-foreground">Property type</div>
            <div className="capitalize">{listing.property_type ?? "—"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Rooms</div>
            <div>{listing.rooms ?? "—"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Bedrooms</div>
            <div>{listing.bedrooms ?? "—"}</div>
          </div>
        </CardContent>
      </Card>

      {listing.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{listing.description}</CardContent>
        </Card>
      )}

      {similar.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-semibold">Similar listings</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((s) => (
              <ListingCard key={s.id} listing={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
