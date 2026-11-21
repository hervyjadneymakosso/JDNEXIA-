-- JDNEXIA : schéma Supabase
-- À exécuter dans Supabase > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.contents (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('film','series')),
  title text not null,
  genre text,
  description text,
  poster_url text,
  release_year integer,
  youtube_url text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.episodes (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.contents(id) on delete cascade,
  season_number integer not null default 1,
  episode_number integer not null default 1,
  title text not null,
  description text,
  youtube_url text not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  unique(series_id, season_number, episode_number)
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.contents enable row level security;
alter table public.episodes enable row level security;
alter table public.admins enable row level security;

-- Catalogue visible uniquement pour les contenus publiés.
create policy "Public read published contents" on public.contents
for select using (published = true or exists (select 1 from public.admins a where a.user_id = auth.uid()));

create policy "Public read published episodes" on public.episodes
for select using (published = true or exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Seuls les administrateurs peuvent modifier le catalogue.
create policy "Admins insert contents" on public.contents for insert
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
create policy "Admins update contents" on public.contents for update
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
create policy "Admins delete contents" on public.contents for delete
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create policy "Admins insert episodes" on public.episodes for insert
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
create policy "Admins update episodes" on public.episodes for update
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
create policy "Admins delete episodes" on public.episodes for delete
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Les utilisateurs connectés peuvent consulter le rôle admin pour leur propre compte seulement.
create policy "Admin can read own role" on public.admins for select
using (user_id = auth.uid());

-- IMPORTANT : après création du compte utilisateur qui sera administrateur,
-- exécuter cette commande en remplaçant l'email :
-- insert into public.admins(user_id)
-- select id from auth.users where email = 'VOTRE_EMAIL_ADMIN';
