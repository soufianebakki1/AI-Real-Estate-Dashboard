-- Generates ~240 synthetic Moroccan listings (source='seed') for the demo dashboard.
-- Not real market data. Run manually via the Supabase MCP execute_sql tool (or the
-- Supabase SQL editor) — this is data seeding, not a schema migration.
-- Remove later with: delete from public.listings where source = 'seed';

with city_data(city, sale_min, sale_max, rent_min, rent_max, neighborhoods) as (
  values
    ('Casablanca', 14000, 24000, 90, 150, array['Maarif','Californie','Bourgogne','Ain Diab','Hay Hassani']),
    ('Rabat', 11000, 19000, 80, 130, array['Agdal','Hay Riad','Souissi','Medina']),
    ('Marrakech', 9000, 17000, 70, 120, array['Gueliz','Hivernage','Medina','Targa']),
    ('Tanger', 8000, 14000, 60, 100, array['Centre Ville','Malabata','Iberia']),
    ('Agadir', 7000, 13000, 55, 90, array['Founty','Talborjt','Secteur Touristique']),
    ('Fès', 6000, 10000, 45, 75, array['Ville Nouvelle','Medina','Saiss'])
),
generated as (
  select
    cd.city,
    cd.neighborhoods[1 + floor(random() * array_length(cd.neighborhoods, 1))::int] as neighborhood,
    case when random() < 0.7 then 'sale' else 'rent' end as transaction_type,
    (array['apartment','apartment','apartment','villa','house','house','office','land'])[1 + floor(random() * 8)::int] as property_type,
    round((50 + random() * 230)::numeric, 0) as surface_m2,
    cd.sale_min, cd.sale_max, cd.rent_min, cd.rent_max
  from city_data cd
  cross join generate_series(1, 40)
)
insert into public.listings (
  source, source_id, url, dedup_key, title, description,
  price, currency, surface_m2, city, neighborhood,
  rooms, bedrooms, property_type, transaction_type,
  raw_json, scraped_at, first_seen_at, last_seen_at, is_active
)
select
  'seed',
  null,
  'https://example.com/demo-listing/' || gen_random_uuid(),
  md5('seed:' || gen_random_uuid()::text),
  (case property_type
     when 'apartment' then 'Appartement'
     when 'villa' then 'Villa'
     when 'house' then 'Maison'
     when 'office' then 'Bureau'
     when 'land' then 'Terrain'
   end) || ' ' || surface_m2::int || 'm² à ' ||
    (case when transaction_type = 'rent' then 'louer' else 'vendre' end) ||
    ' - ' || neighborhood || ', ' || city,
  'Sample listing generated for demo purposes (not a real property).',
  case when transaction_type = 'sale'
    then round(surface_m2 * (sale_min + random() * (sale_max - sale_min)))
    else round(surface_m2 * (rent_min + random() * (rent_max - rent_min)))
  end,
  'MAD',
  surface_m2,
  city,
  neighborhood,
  case when property_type in ('apartment', 'villa', 'house') then 2 + floor(random() * 4)::int else null end,
  case when property_type in ('apartment', 'villa', 'house') then 1 + floor(random() * 3)::int else null end,
  property_type,
  transaction_type,
  '{"synthetic": true}'::jsonb,
  now() - (random() * interval '30 days'),
  now() - (random() * interval '30 days'),
  now(),
  true
from generated;
