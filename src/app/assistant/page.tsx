"use client"

import { useState, type FormEvent } from "react"
import { useChat } from "@ai-sdk/react"
import { SendIcon, SparklesIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "cn"

export default function AssistantPage() {
  const { messages, sendMessage, status, error } = useChat()
  const [input, setInput] = useState("")
  const busy = status === "streaming" || status === "submitted"

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || busy) return
    sendMessage({ text: input })
    setInput("")
  }

  return (
    <div className="flex h-[calc(100vh-6.5rem)] flex-col gap-4">
      <div>
        <h1 className="font-heading text-xl font-semibold">Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Ask about prices, cities, or listings — grounded in the demo dataset, not a live feed.
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {messages.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <SparklesIcon className="size-6 text-primary" />
              <p>&quot;What&apos;s the average price per m² in Marrakech?&quot;</p>
              <p>&quot;Show me the cheapest villas for rent.&quot;</p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                  m.role === "user" ? "bg-primary/10 text-foreground" : "bg-muted text-foreground"
                )}
              >
                {m.parts.map((part, i) => (part.type === "text" ? <span key={i}>{part.text}</span> : null))}
              </div>
            </div>
          ))}
          {status === "submitted" && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">Thinking…</div>
            </div>
          )}
          {status === "error" && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg bg-terracotta/15 px-3 py-2 text-sm text-terracotta">
                {error?.message || "Something went wrong answering that — try again."}
              </div>
            </div>
          )}
        </CardContent>
        <form onSubmit={onSubmit} className="flex items-center gap-2 border-t p-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the market…"
            disabled={busy}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || busy}>
            <SendIcon className="size-4" />
          </Button>
        </form>
      </Card>
    </div>
  )
}
