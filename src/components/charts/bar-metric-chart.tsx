"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

// Sequential single-hue bar chart: magnitude across categories, not distinct
// series — per the dataviz skill, this stays one hue rather than a
// categorical rainbow (color would otherwise imply identity that isn't there).
const chartConfig = {
  value: {
    label: "Value",
    theme: { light: "#2a78d6", dark: "#3987e5" },
  },
} satisfies ChartConfig

export type ValueFormat = "mad" | "count"

function formatValue(value: number, format: ValueFormat): string {
  if (format === "mad") {
    return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(value) + " DH";
  }
  return `${value} listing${value === 1 ? "" : "s"}`;
}

export function BarMetricChart({
  data,
  valueFormat = "count",
}: {
  data: { label: string; value: number }[]
  valueFormat?: ValueFormat
}) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
      <BarChart data={data} margin={{ top: 12, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="0" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={0}
          angle={data.length > 6 ? -30 : 0}
          textAnchor={data.length > 6 ? "end" : "middle"}
          height={data.length > 6 ? 50 : 24}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={44} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value) => (
                <span className="font-mono tabular-nums">
                  {formatValue(value as number, valueFormat)}
                </span>
              )}
            />
          }
        />
        <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ChartContainer>
  )
}
