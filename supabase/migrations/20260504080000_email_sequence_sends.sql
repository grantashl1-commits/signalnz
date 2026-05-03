-- Tracks which onboarding drip emails have been sent to each user
-- Prevents duplicate sends when the drip-emails function runs daily

create table if not exists public.email_sequence_sends (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  email_type  text not null,
  sent_to     text not null,
  sent_at     timestamptz not null default now()
);

create unique index email_sequence_sends_user_type
  on public.email_sequence_sends (user_id, email_type);

-- RLS: only service role can read/write
alter table public.email_sequence_sends enable row level security;

-- Helper function used by the drip-emails edge function
-- Returns users who signed up in the given window and haven't received email_type yet
create or replace function public.get_drip_candidates(
  window_start timestamptz,
  window_end   timestamptz,
  email_type   text
)
returns table (
  id         uuid,
  email      text,
  first_name text
)
language sql
security definer
set search_path = public
as $$
  select
    u.id,
    u.email,
    split_part(coalesce(u.raw_user_meta_data->>'full_name', ''), ' ', 1) as first_name
  from auth.users u
  where u.created_at >= window_start
    and u.created_at <  window_end
    and not exists (
      select 1
      from public.email_sequence_sends s
      where s.user_id    = u.id
        and s.email_type = get_drip_candidates.email_type
    );
$$;
