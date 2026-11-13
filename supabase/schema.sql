create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_id uuid not null references public.profiles on delete cascade,
  theme_type text not null check (theme_type in ('colour', 'word')),
  theme_value text not null,
  game_type text not null check (game_type in ('competitive', 'friendly')),
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'voting', 'ended')),
  ends_at timestamptz,
  location_name text,
  location_lat double precision,
  location_lng double precision,
  created_at timestamptz not null default now()
);

create table public.game_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  joined_at timestamptz not null default now(),
  unique (game_id, user_id)
);

create table public.collages (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  photos jsonb not null default '[]',
  updated_at timestamptz not null default now(),
  unique (game_id, user_id)
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games on delete cascade,
  voter_id uuid not null references public.profiles on delete cascade,
  voted_for_id uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  unique (game_id, voter_id)
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

grant select, insert, update, delete
  on public.profiles, public.games, public.game_players, public.collages, public.votes
  to authenticated;

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.game_players enable row level security;
alter table public.collages enable row level security;
alter table public.votes enable row level security;

create policy "read profiles" on public.profiles
  for select to authenticated using (true);
create policy "update own profile" on public.profiles
  for update to authenticated using (id = auth.uid());

create policy "read games" on public.games
  for select to authenticated using (true);
create policy "create games" on public.games
  for insert to authenticated with check (host_id = auth.uid());
create policy "players update games" on public.games
  for update to authenticated using (
    host_id = auth.uid()
    or exists (
      select 1 from public.game_players
      where game_players.game_id = games.id and game_players.user_id = auth.uid()
    )
  );

create policy "read players" on public.game_players
  for select to authenticated using (true);
create policy "join games" on public.game_players
  for insert to authenticated with check (user_id = auth.uid());
create policy "leave games" on public.game_players
  for delete to authenticated using (user_id = auth.uid());

create policy "read collages" on public.collages
  for select to authenticated using (true);
create policy "create own collage" on public.collages
  for insert to authenticated with check (user_id = auth.uid());
create policy "update own collage" on public.collages
  for update to authenticated using (user_id = auth.uid());
create policy "delete own collage" on public.collages
  for delete to authenticated using (user_id = auth.uid());

create policy "read votes" on public.votes
  for select to authenticated using (true);
create policy "cast own vote" on public.votes
  for insert to authenticated with check (voter_id = auth.uid());

alter publication supabase_realtime add table public.games, public.collages, public.game_players;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('collages', 'collages', true);

create policy "manage own avatar" on storage.objects
  for all to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "manage own collage photos" on storage.objects
  for all to authenticated
  using (bucket_id = 'collages' and (storage.foldername(name))[2] = auth.uid()::text)
  with check (bucket_id = 'collages' and (storage.foldername(name))[2] = auth.uid()::text);
