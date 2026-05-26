-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text not null unique,
  avatar_url text,
  theme_preference text not null default 'zen_garden',
  soundscape_preference text not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Sessions table
create table public.sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  phase text not null check (phase in ('focus', 'short_break', 'long_break')),
  duration_seconds integer not null,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  room_id uuid references public.rooms(id) on delete set null
);

alter table public.sessions enable row level security;

create policy "Users can view own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);

-- Rooms table
create table public.rooms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code char(6) not null unique,
  host_user_id uuid references public.profiles(id) on delete cascade not null,
  theme text not null default 'zen_garden',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.rooms enable row level security;

create policy "Anyone can view active rooms"
  on public.rooms for select
  using (is_active = true);

create policy "Authenticated users can create rooms"
  on public.rooms for insert
  with check (auth.uid() = host_user_id);

create policy "Host can update their rooms"
  on public.rooms for update
  using (auth.uid() = host_user_id);

-- Room members table
create table public.room_members (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid references public.rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'idle' check (status in ('focusing', 'break', 'idle')),
  joined_at timestamptz not null default now(),
  unique (room_id, user_id)
);

alter table public.room_members enable row level security;

create policy "Members can view room members"
  on public.room_members for select
  using (
    exists (
      select 1 from public.room_members rm
      where rm.room_id = room_members.room_id
        and rm.user_id = auth.uid()
    )
  );

create policy "Users can join rooms"
  on public.room_members for insert
  with check (auth.uid() = user_id);

create policy "Users can update own membership"
  on public.room_members for update
  using (auth.uid() = user_id);

create policy "Users can leave rooms"
  on public.room_members for delete
  using (auth.uid() = user_id);

-- Enable realtime for rooms and members
alter publication supabase_realtime add table public.room_members;
alter publication supabase_realtime add table public.rooms;

-- Indexes
create index sessions_user_id_completed_at on public.sessions(user_id, completed_at desc);
create index room_members_room_id on public.room_members(room_id);
