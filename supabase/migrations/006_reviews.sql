create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid references profiles(id) on delete cascade,
  reviewed_user_id uuid references profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (reviewer_id, reviewed_user_id),
  check (reviewer_id <> reviewed_user_id)
);

alter table reviews enable row level security;

create index if not exists reviews_reviewed_user_idx on reviews(reviewed_user_id);
create index if not exists reviews_reviewer_idx on reviews(reviewer_id);

drop policy if exists "reviews_select_all" on reviews;
create policy "reviews_select_all" on reviews for select using (true);

drop policy if exists "reviews_insert_all" on reviews;
create policy "reviews_insert_all" on reviews for insert with check (true);

drop policy if exists "reviews_update_all" on reviews;
create policy "reviews_update_all" on reviews for update using (true);

notify pgrst, 'reload schema';
