import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages, type UIMessage } from "ai";

import { createBrowserClient } from "@/lib/supabase/client";

export const maxDuration = 30;

const SYSTEM_PROMPT_HEADER = `You are the Daridash market assistant, embedded in a Moroccan real estate dashboard.

Important context: all listings below are SYNTHETIC DEMO DATA generated for a portfolio project, not real properties. If asked whether this is real data, say so plainly.

Answer questions using ONLY the listings and market-stats data provided below. Do not invent listings, prices, or cities that aren't in the data. If asked something the data can't answer, say you don't have that information rather than guessing. Prices are in Moroccan Dirhams (MAD/DH). Keep answers concise and to the point.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const supabase = createBrowserClient();
  const [{ data: listings }, { data: stats }] = await Promise.all([
    supabase
      .from("listings")
      .select(
        "title, city, neighborhood, property_type, transaction_type, price, currency, surface_m2, price_per_sqm, rooms, bedrooms"
      )
      .eq("is_active", true)
      .limit(240),
    supabase.from("price_stats_city").select("*"),
  ]);

  const system = `${SYSTEM_PROMPT_HEADER}

Listings (JSON array, ${listings?.length ?? 0} total):
${JSON.stringify(listings ?? [])}

Market stats by city/property type/transaction type (median, avg, stddev of price per m², JSON array):
${JSON.stringify(stats ?? [])}`;

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("x-api-key") || message.includes("401") || message.includes("authentication_error")) {
        return "The assistant isn't configured yet — missing an Anthropic API key.";
      }
      if (message.includes("credit balance")) {
        return "The Anthropic account behind this assistant is out of credits — add credits at console.anthropic.com to re-enable it.";
      }
      console.error("[chat] stream error:", message);
      return "Something went wrong answering that — try again.";
    },
  });
}
