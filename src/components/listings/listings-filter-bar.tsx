"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CITIES = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès"]
const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "house", label: "House" },
  { value: "office", label: "Office" },
  { value: "land", label: "Land" },
]
const TRANSACTION_TYPES = [
  { value: "sale", label: "For sale" },
  { value: "rent", label: "For rent" },
]

export function ListingsFilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const city = searchParams.get("city") ?? "all"
  const type = searchParams.get("type") ?? "all"
  const transaction = searchParams.get("transaction") ?? "all"

  const typeLabel = PROPERTY_TYPES.find((t) => t.value === type)?.label ?? "All types"
  const transactionLabel = TRANSACTION_TYPES.find((t) => t.value === transaction)?.label ?? "Sale & rent"

  return (
    <div className="flex flex-wrap gap-2">
      <Select value={city} onValueChange={(v) => setParam("city", v as string)}>
        <SelectTrigger size="sm">
          <SelectValue placeholder="City">{city === "all" ? "All cities" : city}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All cities</SelectItem>
          {CITIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={type} onValueChange={(v) => setParam("type", v as string)}>
        <SelectTrigger size="sm">
          <SelectValue placeholder="Property type">{typeLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {PROPERTY_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={transaction} onValueChange={(v) => setParam("transaction", v as string)}>
        <SelectTrigger size="sm">
          <SelectValue placeholder="Sale or rent">{transactionLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Sale &amp; rent</SelectItem>
          {TRANSACTION_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
