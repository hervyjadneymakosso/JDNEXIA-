-- JDNEXIA : favoris et historique de visionnage
-- Migration additive : ne supprime aucune table ni donnée existante.
-- À exécuter une seule fois dans Supabase > SQL Editor.

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id uuid not null references public.contents(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create table if not exists public.watch_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id uuid not null references public.contents(id) on delete cascade,
  episode_id uuid references public.episodes(id) on delete set null,
  watched_at timestamptz not null default now(),
  progress_seconds integer not null default 0 check (progress_seconds >= 0),
  primary key (user_id, content_id)
);

create index if not exists watch_history_recent_idx
  on public.watch_history(user_id, watched_at desc);

alter table public.favorites enable row level security;
alter table public.watch_history enable row level security;

drop policy if exists "Users manage own favorites" on public.favorites;
create policy "Users manage own favorites" on public.favorites
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users manage own watch history" on public.watch_history;
create policy "Users manage own watch history" on public.watch_history
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select, insert, update, delete on public.favorites to authenticated;
grant select, insert, update, delete on public.watch_history to authenticated;
