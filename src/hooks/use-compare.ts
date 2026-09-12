"use client"

import { useCallback, useSyncExternalStore } from "react"

const KEY = "daridash:compare"
export const COMPARE_MAX = 3

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
    // private browsing / quota exceeded
  }
  listeners.forEach((listener) => listener())
}

/** Live-synced across every component on the page via useSyncExternalStore. */
export function useCompareIds(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function useCompareToggle(id: string) {
  const ids = useCompareIds()
  const selected = ids.includes(id)
  const atMax = ids.length >= COMPARE_MAX && !selected

  const toggle = useCallback(() => {
    const current = getSnapshot()
    const exists = current.includes(id)
    if (exists) {
      setIds(current.filter((i) => i !== id))
    } else if (current.length < COMPARE_MAX) {
      setIds([...current, id])
    }
  }, [id])

  return { selected, atMax, toggle }
}

export function clearCompare() {
  setIds([])
}
