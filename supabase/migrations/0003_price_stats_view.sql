create or replace view public.price_stats as
select
  city,
  neighborhood,
  property_type,
  transaction_type,
  count(*) as sample_size,
  percentile_cont(0.5) within group (order by price_per_sqm) as median_price_per_sqm,
  avg(price_per_sqm) as avg_price_per_sqm,
  stddev(price_per_sqm) as stddev_price_per_sqm
from public.listings
where price_per_sqm is not null and is_active
group by city, neighborhood, property_type, transaction_type;

create or replace view public.price_stats_city as
select
  city,
  property_type,
  transaction_type,
  count(*) as sample_size,
  percentile_cont(0.5) within group (order by price_per_sqm) as median_price_per_sqm,
  avg(price_per_sqm) as avg_price_per_sqm,
  stddev(price_per_sqm) as stddev_price_per_sqm
from public.listings
where price_per_sqm is not null and is_active
group by city, property_type, transaction_type;
