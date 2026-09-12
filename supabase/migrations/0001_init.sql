create extension if not exists pgcrypto;

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('avito','mubawab','sarouty')),
  source_id text,
  url text not null,
  dedup_key text not null unique,
  title text not null,
  description text,
  price numeric,
  currency text not null default 'MAD',
  surface_m2 numeric,
  price_per_sqm numeric generated always as (
    case when surface_m2 > 0 and price is not null
      then round(price / surface_m2, 2) end
  ) stored,
  city text,
  neighborhood text,
  rooms integer,
  bedrooms integer,
  property_type text,
  transaction_type text check (transaction_type in ('sale','rent')),
  raw_json jsonb not null,
  scraped_at timestamptz not null default now(),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_listings_city_neighborhood on public.listings (city, neighborhood);
create index idx_listings_type on public.listings (property_type, transaction_type);
create index idx_listings_source on public.listings (source);
create index idx_listings_scraped_at on public.listings (scraped_at desc);

create table public.scrape_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running','success','failed','partial')),
  listings_found integer default 0,
  listings_inserted integer default 0,
  listings_updated integer default 0,
  error_message text,
  params jsonb
);

alter table public.listings enable row level security;
create policy "public read" on public.listings for select using (true);
-- writes only via service role (bypasses RLS) from the scraper
