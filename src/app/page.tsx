import {
  getAnalyticsRows,
  avgPricePerSqmByCity,
  listingsByPropertyType,
  saleVsRentSplit,
  priceDistribution,
  analyticsSummary,
} from "@/lib/db/analytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarMetricChart } from "@/components/charts/bar-metric-chart";
import { ProportionBar } from "@/components/charts/proportion-bar";
import { ZelligePattern } from "@/components/branding/zellige-pattern";

export const dynamic = "force-dynamic";

function formatMAD(value: number) {
  return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(value) + " DH";
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export default async function OverviewPage() {
  const rows = await getAnalyticsRows();
  const summary = analyticsSummary(rows);
  const priceByCity = avgPricePerSqmByCity(rows);
  const byPropertyType = listingsByPropertyType(rows);
  const saleVsRent = saleVsRentSplit(rows);
  const distribution = priceDistribution(rows);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-xl border bg-card p-6 sm:p-8">
        <ZelligePattern
          seed="overview-hero"
          color="var(--primary)"
          cols={12}
          rows={4}
          className="pointer-events-none absolute inset-y-0 right-0 w-2/3 opacity-[0.12] [mask-image:linear-gradient(to_left,black,transparent)]"
        />
        <div className="relative">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Overview</p>
          <p className="mt-2 font-heading text-5xl font-semibold tracking-tight sm:text-6xl">
            {summary.avgPricePerSqm != null ? formatMAD(summary.avgPricePerSqm) : "—"}
          </p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Average price per m², sale listings across {summary.cities} Moroccan cities.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Total listings</CardDescription>
            <CardTitle className="font-heading text-2xl">{formatCompact(summary.total)}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Avg price / m² (sale)</CardDescription>
            <CardTitle className="font-heading text-2xl">
              {summary.avgPricePerSqm != null ? formatMAD(summary.avgPricePerSqm) : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Cities covered</CardDescription>
            <CardTitle className="font-heading text-2xl">{summary.cities}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>For sale / for rent</CardDescription>
            <CardTitle className="font-heading text-2xl">
              {summary.saleCount} / {summary.rentCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Avg price / m² by city</CardTitle>
            <CardDescription>Sale listings only</CardDescription>
          </CardHeader>
          <CardContent>
            <BarMetricChart
              data={priceByCity.map((d) => ({ label: d.city, value: d.avgPricePerSqm }))}
              valueFormat="mad"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Price distribution</CardTitle>
            <CardDescription>Sale listings, by price bracket (MAD)</CardDescription>
          </CardHeader>
          <CardContent>
            <BarMetricChart
              data={distribution.map((d) => ({ label: d.range, value: d.count }))}
              valueFormat="count"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listings by property type</CardTitle>
          </CardHeader>
          <CardContent>
            <ProportionBar segments={byPropertyType} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sale vs rent split</CardTitle>
          </CardHeader>
          <CardContent>
            <ProportionBar segments={saleVsRent} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
