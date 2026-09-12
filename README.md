# Daridash — AI Real Estate Dashboard (Morocco)

A portfolio project: an AI-assisted real estate market dashboard focused on Moroccan cities, built with Next.js and Supabase.

Currently runs on **seeded demo data** (240 synthetic listings across Casablanca, Rabat, Marrakech, Tanger, Agadir, and Fès) — clearly labeled in the UI — while the real-data pipeline (a working Mubawab.ma scraper is already built in `src/scrapers/`) is wired up separately.

## Features

- **Overview** — market KPIs and charts (avg price/m² by city, price distribution, property type mix, sale vs. rent split)
- **Listings** — grid, table, and map views with filters, favorites, and a compare tool
- **Fair-value score** — a deterministic (non-LLM) price/m² comparison against neighborhood and city medians
- **AI assistant** — a chat assistant (Claude via the Vercel AI SDK) grounded in the actual listings and market-stats data
- **Command palette** (⌘K) — jump to any page or listing
- A generated zellige-tile pattern stands in for listing photos (no real photos exist for synthetic listings), colored by property type; real Unsplash photos are used as well

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase (Postgres) · Vercel AI SDK + Claude · Leaflet

## Getting started

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from your Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` — only needed to run the scraper (`pnpm scrape:mubawab`)
- `ANTHROPIC_API_KEY` — needed for the `/assistant` chat page

Database schema and seed data live in `supabase/migrations/` and `supabase/seed.sql`.
