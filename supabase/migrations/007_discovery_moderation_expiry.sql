-- Nearby discovery, moderation depth, persistent blocks, and real expiry.

alter table profiles
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

alter table listings
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists expires_at timestamptz not null default (now() + interval '30 days'),
  add column if not exists moderation_note text default '';

alter table listings
  drop constraint if exists listings_status_check;

alter table listings
  add constraint listings_status_check
  check (status in ('active', 'sold', 'expired', 'flagged', 'removed'));

update listings
set expires_at = created_at + interval '30 days'
where expires_at is null;

create table if not exists user_blocks (
  blocker_id uuid references profiles(id) on delete cascade,
  blocked_id uuid references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table if not exists moderation_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  target_type text not null check (target_type in ('listing', 'user', 'report')),
  target_id uuid not null,
  action text not null,
  note text default '',
  created_at timestamptz not null default now()
);

alter table reports
  add column if not exists resolution_note text default '',
  add column if not exists resolved_by uuid references profiles(id) on delete set null,
  add column if not exists resolved_at timestamptz;

create index if not exists listings_geo_idx on listings(latitude, longitude);
create index if not exists listings_expires_at_idx on listings(expires_at);
create index if not exists listings_status_idx on listings(status);
create index if not exists user_blocks_blocker_idx on user_blocks(blocker_id);
create index if not exists user_blocks_blocked_idx on user_blocks(blocked_id);
create index if not exists moderation_logs_target_idx on moderation_logs(target_type, target_id);

alter table user_blocks enable row level security;
alter table moderation_logs enable row level security;

drop policy if exists "user_blocks_select_all" on user_blocks;
create policy "user_blocks_select_all" on user_blocks for select using (true);
drop policy if exists "user_blocks_insert_all" on user_blocks;
create policy "user_blocks_insert_all" on user_blocks for insert with check (true);
drop policy if exists "user_blocks_delete_all" on user_blocks;
create policy "user_blocks_delete_all" on user_blocks for delete using (true);

-- Admin-only in practice: all writes/reads are intended to go through service-role API routes.
drop policy if exists "moderation_logs_no_anon_select" on moderation_logs;
create policy "moderation_logs_no_anon_select" on moderation_logs for select using (false);

create or replace function distance_km(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
)
returns double precision
language sql
immutable
as $$
  select case
    when lat1 is null or lon1 is null or lat2 is null or lon2 is null then null
    else 6371 * acos(
      least(
        1,
        greatest(
          -1,
          cos(radians(lat1)) * cos(radians(lat2)) *
          cos(radians(lon2) - radians(lon1)) +
          sin(radians(lat1)) * sin(radians(lat2))
        )
      )
    )
  end;
$$;

create or replace function search_nearby_listings(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision,
  search_query text default null,
  category_filter text default null,
  min_price numeric default null,
  max_price numeric default null,
  condition_filters text[] default null,
  date_cutoff timestamptz default null,
  result_limit integer default 20,
  result_offset integer default 0
)
returns table (
  id uuid,
  seller_id uuid,
  title text,
  description text,
  price numeric,
  original_price numeric,
  category text,
  condition text,
  images text[],
  video_url text,
  location text,
  latitude double precision,
  longitude double precision,
  featured boolean,
  featured_status text,
  status text,
  created_at timestamptz,
  views integer,
  expires_at timestamptz,
  moderation_note text,
  distance_km double precision
)
language sql
stable
as $$
  select
    l.id,
    l.seller_id,
    l.title,
    l.description,
    l.price,
    l.original_price,
    l.category,
    l.condition,
    l.images,
    l.video_url,
    l.location,
    l.latitude,
    l.longitude,
    l.featured,
    l.featured_status,
    l.status,
    l.created_at,
    l.views,
    l.expires_at,
    l.moderation_note,
    distance_km(user_lat, user_lng, l.latitude, l.longitude) as distance_km
  from listings l
  where l.status = 'active'
    and l.expires_at > now()
    and l.latitude is not null
    and l.longitude is not null
    and (radius_km is null or distance_km(user_lat, user_lng, l.latitude, l.longitude) <= radius_km)
    and (search_query is null or l.title ilike '%' || search_query || '%' or l.description ilike '%' || search_query || '%')
    and (category_filter is null or l.category = category_filter)
    and (min_price is null or l.price >= min_price)
    and (max_price is null or l.price <= max_price)
    and (condition_filters is null or l.condition = any(condition_filters))
    and (date_cutoff is null or l.created_at >= date_cutoff)
  order by
    case when l.featured and l.featured_status = 'approved' then 0 else 1 end,
    distance_km asc nulls last,
    l.created_at desc
  limit result_limit
  offset result_offset;
$$;
