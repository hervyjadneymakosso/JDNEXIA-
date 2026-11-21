-- JDNEXIA : classement et univers du catalogue
-- Migration additive : conserve les contenus existants.
alter table public.contents
  add column if not exists category text not null default 'Cinéma',
  add column if not exists sort_order integer not null default 1000;

create index if not exists contents_catalog_order_idx
  on public.contents(type, published, sort_order asc, created_at desc);
