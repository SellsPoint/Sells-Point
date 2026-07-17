create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references profiles(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  type text not null,
  entity_id uuid,
  entity_type text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table notifications enable row level security;

alter table notifications
  drop constraint if exists notifications_type_check;

alter table notifications
  add constraint notifications_type_check
  check (type in ('message', 'favorite', 'listing_sold', 'price_drop', 'admin', 'featured_approved', 'featured_rejected', 'user_banned'));

create index if not exists notifications_recipient_idx on notifications(recipient_id);

drop policy if exists "notifications_select_own" on notifications;
create policy "notifications_select_own" on notifications for select using (true);

drop policy if exists "notifications_insert_all" on notifications;
create policy "notifications_insert_all" on notifications for insert with check (true);

drop policy if exists "notifications_update_own" on notifications;
create policy "notifications_update_own" on notifications for update using (true);

do $$
begin
  alter publication supabase_realtime add table notifications;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

notify pgrst, 'reload schema';
