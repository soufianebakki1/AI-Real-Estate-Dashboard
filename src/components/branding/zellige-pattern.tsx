import type { ReactNode } from "react"
import { hashSeed, mulberry32 } from "@/lib/design/property-colorway"

/**
 * Generates a unique-but-stable 8-point-star (khatam) tessellation from a
 * seed string — this is the dashboard's signature visual element, standing
 * in for real listing photos that don't exist for synthetic data. Pure SVG,
 * deterministic, no external assets.
 */
function starPoints(cx: number, cy: number, outerR: number, innerR: number): string {
  const points: string[] = []
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8 - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }
  return points.join(" ")
}

export function ZelligePattern({
  seed,
  color = "var(--primary)",
  cols = 5,
  rows = 3,
  className,
}: {
  seed: string
  color?: string
  cols?: number
  rows?: number
  className?: string
}) {
  const rand = mulberry32(hashSeed(seed))
  const cellSize = 40
  const width = cols * cellSize
  const height = rows * cellSize

  const cells: ReactNode[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = col * cellSize + cellSize / 2
      const cy = row * cellSize + cellSize / 2
      const rotation = (row + col) % 2 === 0 ? 0 : 22.5
      const filled = rand() < 0.28
      const outer = cellSize * 0.42
      const inner = outer * 0.42

      cells.push(
        <g key={`${row}-${col}`} transform={`rotate(${rotation} ${cx} ${cy})`}>
          <polygon
            points={starPoints(cx, cy, outer, inner)}
            fill={filled ? color : "none"}
            fillOpacity={filled ? 0.85 : 0}
            stroke={color}
            strokeOpacity={0.32}
            strokeWidth={1}
          />
        </g>
      )
    }
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      <rect width={width} height={height} fill={color} fillOpacity={0.06} />
      {cells}
    </svg>
  )
}
