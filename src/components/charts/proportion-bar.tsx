// Plain HTML/CSS part-to-whole chart (a horizontal single stacked bar), per
// the dataviz skill's guidance that a stacked bar reads part-to-whole better
// than a pie. Fixed categorical hues (--chart-cat-1..6 in globals.css, light
// and dark steps of the validated palette), 2px surface gap between segments,
// legend with direct percentage labels (<=6 series here, so no folding needed).
const CATEGORICAL_VARS = [
  "var(--chart-cat-1)",
  "var(--chart-cat-2)",
  "var(--chart-cat-3)",
  "var(--chart-cat-4)",
  "var(--chart-cat-5)",
  "var(--chart-cat-6)",
]

export interface ProportionSegment {
  key: string
  label: string
  count: number
  pct: number
}

export function ProportionBar({ segments }: { segments: ProportionSegment[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-6 w-full overflow-hidden rounded-md bg-muted">
        {segments.map((seg, i) => (
          <div
            key={seg.key}
            className="h-full first:rounded-l-md last:rounded-r-md"
            style={{
              width: `${seg.pct}%`,
              backgroundColor: CATEGORICAL_VARS[i % CATEGORICAL_VARS.length],
              marginRight: i < segments.length - 1 ? 2 : 0,
            }}
            title={`${seg.label}: ${seg.count} (${seg.pct.toFixed(0)}%)`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((seg, i) => (
          <div key={seg.key} className="flex items-center gap-1.5 text-xs">
            <span
              className="size-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: CATEGORICAL_VARS[i % CATEGORICAL_VARS.length] }}
            />
            <span className="text-muted-foreground">{seg.label}</span>
            <span className="font-mono tabular-nums text-foreground">{seg.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
