-- ============================================================
-- Manzeli — Supabase Schema
-- Run this in the Supabase SQL editor (project > SQL Editor)
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────
create type public.role as enum ('admin', 'host');
create type public.availability_status as enum ('available', 'booked', 'blocked');

-- ── profiles ─────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  name        text not null,
  phone       text,
  whatsapp    text,
  role        public.role not null default 'host',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── listings ─────────────────────────────────────────────────
create table public.listings (
  id            uuid primary key default gen_random_uuid(),
  host_id       uuid not null references public.profiles on delete cascade,
  title         text not null,
  slug          text not null unique,
  description   text not null,
  location      text not null,
  price         numeric(10,2) not null check (price > 0),
  bedrooms      int not null default 1 check (bedrooms >= 0),
  bathrooms     int not null default 1 check (bathrooms >= 0),
  max_guests    int not null default 2 check (max_guests > 0),
  pet_friendly  boolean not null default false,
  pool          boolean not null default false,
  wifi          boolean not null default false,
  parking       boolean not null default false,
  ac            boolean not null default false,
  bbq           boolean not null default false,
  sea_view      boolean not null default false,
  mountain_view boolean not null default false,
  latitude      numeric(10,7),
  longitude     numeric(10,7),
  house_rules   text[] not null default '{}',
  is_featured   boolean not null default false,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── listing_images ────────────────────────────────────────────
create table public.listing_images (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid not null references public.listings on delete cascade,
  url           text not null,
  display_order int not null default 0,
  alt_text      text,
  created_at    timestamptz not null default now()
);

-- ── listing_rooms ─────────────────────────────────────────────
create table public.listing_rooms (
  id               uuid primary key default gen_random_uuid(),
  listing_id       uuid not null references public.listings on delete cascade,
  name             text not null,
  beds             int not null default 1 check (beds > 0),
  view_description text,
  created_at       timestamptz not null default now()
);

-- ── availability ─────────────────────────────────────────────
create table public.availability (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings on delete cascade,
  date       date not null,
  status     public.availability_status not null default 'available',
  note       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, date)
);

-- ── Indexes ──────────────────────────────────────────────────
create index idx_listings_host_id       on public.listings (host_id);
create index idx_listings_slug          on public.listings (slug);
create index idx_listings_is_active     on public.listings (is_active);
create index idx_listings_is_featured   on public.listings (is_featured);
create index idx_listing_images_listing on public.listing_images (listing_id, display_order);
create index idx_listing_rooms_listing  on public.listing_rooms (listing_id);
create index idx_availability_listing_date on public.availability (listing_id, date);

-- ── updated_at trigger function ───────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

create trigger trg_availability_updated_at
  before update on public.availability
  for each row execute function public.set_updated_at();

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── Auto-create profile on signup ────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    'host'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Enable Row Level Security ─────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.listings      enable row level security;
alter table public.listing_images enable row level security;
alter table public.listing_rooms  enable row level security;
alter table public.availability   enable row level security;

-- ── Helper: get the current user's role ───────────────────────
create or replace function public.get_my_role()
returns public.role language sql stable security definer set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ── RLS: profiles ─────────────────────────────────────────────
-- Users can read their own profile; admins can read all
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid() or public.get_my_role() = 'admin');

-- Users can update their own profile; admins can update any
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid() or public.get_my_role() = 'admin');

-- Only admins can insert/delete profiles manually
create policy "profiles_insert_admin"
  on public.profiles for insert
  with check (public.get_my_role() = 'admin');

create policy "profiles_delete_admin"
  on public.profiles for delete
  using (public.get_my_role() = 'admin');

-- ── RLS: listings ─────────────────────────────────────────────
-- Public: anyone can read active listings
create policy "listings_select_active"
  on public.listings for select
  using (is_active = true or host_id = auth.uid() or public.get_my_role() = 'admin');

-- Host: can insert their own listings
create policy "listings_insert_host"
  on public.listings for insert
  with check (host_id = auth.uid() and public.get_my_role() in ('host', 'admin'));

-- Host: can update their own listings; admin can update any
create policy "listings_update_own"
  on public.listings for update
  using (host_id = auth.uid() or public.get_my_role() = 'admin');

-- Only admins can delete listings
create policy "listings_delete_admin"
  on public.listings for delete
  using (public.get_my_role() = 'admin');

-- ── RLS: listing_images ───────────────────────────────────────
create policy "listing_images_select"
  on public.listing_images for select
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and (l.is_active = true or l.host_id = auth.uid() or public.get_my_role() = 'admin')
    )
  );

create policy "listing_images_write_host"
  on public.listing_images for all
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and (l.host_id = auth.uid() or public.get_my_role() = 'admin')
    )
  );

-- ── RLS: listing_rooms ────────────────────────────────────────
create policy "listing_rooms_select"
  on public.listing_rooms for select
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and (l.is_active = true or l.host_id = auth.uid() or public.get_my_role() = 'admin')
    )
  );

create policy "listing_rooms_write_host"
  on public.listing_rooms for all
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and (l.host_id = auth.uid() or public.get_my_role() = 'admin')
    )
  );

-- ── RLS: availability ─────────────────────────────────────────
-- Public can read availability for active listings
create policy "availability_select"
  on public.availability for select
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and (l.is_active = true or l.host_id = auth.uid() or public.get_my_role() = 'admin')
    )
  );

-- Host: can insert/update availability for their own listings; admin: any
create policy "availability_write_host"
  on public.availability for insert
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and (l.host_id = auth.uid() or public.get_my_role() = 'admin')
    )
  );

create policy "availability_update_host"
  on public.availability for update
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and (l.host_id = auth.uid() or public.get_my_role() = 'admin')
    )
  );

create policy "availability_delete_host"
  on public.availability for delete
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and (l.host_id = auth.uid() or public.get_my_role() = 'admin')
    )
  );
