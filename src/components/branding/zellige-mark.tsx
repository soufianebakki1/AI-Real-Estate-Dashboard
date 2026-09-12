export function ZelligeMark({ className }: { className?: string }) {
  const outer = 10
  const inner = 4.2
  const cx = 12
  const cy = 12

  const points: string[] = []
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8 - Math.PI / 2
    const r = i % 2 === 0 ? outer : inner
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polygon points={points.join(" ")} fill="currentColor" />
    </svg>
  )
}
