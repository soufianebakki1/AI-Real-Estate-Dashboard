import { TriangleAlertIcon } from "lucide-react"

export function DemoDataBanner() {
  return (
    <div className="flex items-center gap-2 border-b border-brass/20 bg-brass/10 px-4 py-1.5 text-xs text-brass">
      <TriangleAlertIcon className="size-3.5 shrink-0" />
      <span>
        Demo data — sample listings generated for preview, not live market data.
      </span>
    </div>
  )
}
