"use client"

import { SearchIcon } from "lucide-react"

export function CommandPaletteTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
      className="flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
    >
      <SearchIcon className="size-3.5" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden rounded border bg-muted px-1 font-mono text-[10px] sm:inline">⌘K</kbd>
    </button>
  )
}
