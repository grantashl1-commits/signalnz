-- Feed posts table for Signal NZ book insight feed
-- 1,750 posts generated from 175 books, 10 posts each
-- 5 posts shown per day, themed

create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  post_number integer not null,
  post_title_description text not null,
  book_title_author text not null,
  themes text[] default '{}',
  been_published boolean default false,
  publish_date date,
  created_at timestamptz default now()
);

-- Index for date-based feed queries (5 posts/day view)
create index on public.feed_posts (publish_date);
create index on public.feed_posts (post_number);

-- Enable RLS
alter table public.feed_posts enable row level security;

-- Feed is publicly readable (no auth required)
create policy "Feed posts are publicly readable"
  on public.feed_posts for select
  using (true);
