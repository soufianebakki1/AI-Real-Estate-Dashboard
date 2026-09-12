alter table public.listings drop constraint listings_source_check;
alter table public.listings add constraint listings_source_check check (source in ('avito','mubawab','sarouty','seed'));
