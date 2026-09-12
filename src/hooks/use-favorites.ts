"use client"

import { useCallback, useSyncExternalStore } from "react"

const KEY = "daridash:favorites"

type Listener = () => void
const listeners = new Set<Listener>()
let cache: string[] | null = null

function readIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function getSnapshot(): string[] {
  if (cache === null) cache = readIds()
  return cache
}

const EMPTY_IDS: string[] = []

function getServerSnapshot(): string[] {
  return EMPTY_IDS
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function setIds(next: string[]) {
  cache = next
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // private browsing / quota exceeded — favoriting just won't persist
  }
  listeners.forEach((listener) => listener())
}

/** Full favorites list, live-synced across every mounted component. */
export function useFavoriteIds(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/** Per-card favorite state for a single listing id. */
export function useFavorite(id: string) {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const isFavorite = ids.includes(id)

  const toggle = useCallback(() => {
    const current = getSnapshot()
    setIds(current.includes(id) ? current.filter((i) => i !== id) : [...current, id]);
  }, [id])

  return { isFavorite, toggle }
}
