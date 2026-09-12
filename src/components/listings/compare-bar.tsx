"use client"

import Link from "next/link"
import { XIcon } from "lucide-react"
import { useCompareIds, clearCompare } from "@/hooks/use-compare"

export function CompareBar() {
  const ids = useCompareIds()
  if (ids.length === 0) return null

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-full border bg-card px-4 py-2 shadow-lg">
        <span className="text-sm">
          {ids.length} listing{ids.length === 1 ? "" : "s"} selected
        </span>
        {ids.length >= 2 ? (
          <Link href="/compare" className="text-sm font-medium text-primary hover:underline">
            Compare
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground">Select 1 more</span>
        )}
        <button
          type="button"
          aria-label="Clear comparison"
          onClick={() => clearCompare()}
          className="flex size-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
        >
          <XIcon className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
