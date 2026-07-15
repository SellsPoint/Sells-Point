create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_by uuid references profiles(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table announcements enable row level security;

drop policy if exists "announcements_select_all" on announcements;
create policy "announcements_select_all" on announcements for select using (true);

create index if not exists announcements_created_at_idx on announcements(created_at desc);
