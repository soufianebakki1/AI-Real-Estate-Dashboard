"use client"

import { cn } from "cn"
import { useCompareToggle } from "@/hooks/use-compare"

export function CompareToggleChip({ id }: { id: string }) {
  const { selected, atMax, toggle } = useCompareToggle(id)

  return (
    <button
      type="button"
      disabled={atMax}
      aria-pressed={selected}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle()
      }}
      className={cn(
        "rounded-full border px-2 py-0.5 text-[11px] transition-colors",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:text-foreground",
        atMax && "cursor-not-allowed opacity-50"
      )}
    >
      {selected ? "✓ Comparing" : "+ Compare"}
    </button>
  )
}
