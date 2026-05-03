alter table public.profiles
  add column if not exists email_invalid        boolean     default false,
  add column if not exists email_invalid_reason text;
