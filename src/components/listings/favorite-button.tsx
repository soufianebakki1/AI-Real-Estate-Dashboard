"use client"

import { HeartIcon } from "lucide-react"
import { cn } from "cn"
import { useFavorite } from "@/hooks/use-favorites"

export function FavoriteButton({ id, className }: { id: string; className?: string }) {
  const { isFavorite, toggle } = useFavorite(id)

  return (
    <button
      type="button"
      aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={isFavorite}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle()
      }}
      className={cn(
        "flex size-7 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background",
        className
      )}
    >
      <HeartIcon className={cn("size-4", isFavorite ? "fill-terracotta text-terracotta" : "text-foreground")} />
    </button>
  )
}
