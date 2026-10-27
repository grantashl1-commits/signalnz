# Live database setup: signalnz (`uinooijckvltyuggecuh`)

The app code on `main` expects six database changes, anonymous
sign-ins and freshly deployed edge functions. None of this can be done from the repo
alone; follow these steps in the Supabase dashboard (or the CLI) for the live project.

Do the steps in order. Every SQL file here is safe to run twice.

**Most urgent:** Supabase's "Table publicly accessible" warning is fixed by one file,
`supabase/migrations/20261027000005_rls_on_every_public_table.sql`. It doesn't depend on
the other steps, so after the backup (step 0) you can run it on its own first (step 3).

## 0. Take a backup first

Dashboard → **Database → Backups**: check there is a backup from today. If not (or on the
free plan), save one locally (this needs Docker Desktop running):

```powershell
npx supabase login
npx supabase link --project-ref uinooijckvltyuggecuh
npx supabase db dump -f backup-2026-10-27.sql
```

## 1. Look before changing anything (read-only)

Paste into **SQL Editor** and run. Nothing here changes data.

```sql
-- Which repo migrations the live project has recorded (newest first).
select version, name from supabase_migrations.schema_migrations order by version desc limit 15;

-- Tables in public with row-level security OFF, and whether the app's roles can read them.
-- This is what Supabase's 17 Oct "Table publicly accessible" email is about.
select c.relname as table_name,
       e.extname as owned_by_extension,
       has_table_privilege('anon', c.oid, 'SELECT')          as anon_can_read,
       has_table_privilege('authenticated', c.oid, 'SELECT') as members_can_read
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_depend d    on d.objid = c.oid and d.deptype = 'e'
left join pg_extension e on e.oid = d.refobjid
where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity
order by 1;

-- Is anything of ours built on PostGIS? (Expected: no rows.)
select table_name, column_name, udt_name from information_schema.columns
where table_schema = 'public' and udt_name in ('geometry', 'geography')
  and table_name not in ('geometry_columns', 'geography_columns');

-- Is the cron secret in the Vault? (Needed by migration 000002.)
select name from vault.secrets where name = 'cron_secret';
```

Note what the second query lists; step 3 depends on it.

## 2. Apply the 27 October migrations

| File | What it does | Needs |
| --- | --- | --- |
| `20261027000000_close_connect_anon_access.sql` | Connect: only the member and her linked partner can read their reflections, check-ins and answers. Partners join through `join_partner_connection` (code + PIN, 5 tries a minute). Same as `drizzle/migrations/0006`. | Anonymous sign-ins on (step 4), or partners can't join. |
| `20261027000001_membership_grants.sql` | Manual paid tiers by email, before Stripe exists. | — |
| `20261027000002_fix_cron_project_ref.sql` | Points the daily drip-email job at this project instead of a stranger's. | A Vault secret `cron_secret` equal to the edge-function secret `CRON_SECRET`. |
| `20261027000003_lock_down_ai_credits.sql` | Members can no longer write their own AI credits or drain someone else's. | — |
| `20261027000004_community_safety.sql` | Blocking, reporting (admin Reports tab), hidden profile fields stay hidden, Nearby coordinates rounded to ~1 km. | — |
| `20261027000005_rls_on_every_public_table.sql` | Fixes Supabase's "Table publicly accessible" warning (step 3). | — |

**Option A: CLI** (when `migration list` shows only these six missing):

```powershell
npx supabase migration list          # "Local" vs "Remote" columns
npx supabase db push --dry-run       # shows exactly what would run
npx supabase db push
```

If `migration list` shows lots of older files as missing on Remote (Lovable applied them
another way), **don't push**: the CLI would try to re-run all of them. Use option B.

**Option B: SQL Editor.** Open each file above in order, paste its whole contents, run.

If `cron_secret` was missing in step 1, add it before 000002 (use the same value as the
`CRON_SECRET` edge-function secret; set that too if it isn't set yet):

```sql
select vault.create_secret('<the CRON_SECRET value>', 'cron_secret');
```

## 3. Fix the table Supabase emailed about

Supabase's emails (17 and 25 Oct, "Table publicly accessible", `rls_disabled_in_public`)
don't name the table. One file fixes whichever it is:
`supabase/migrations/20261027000005_rls_on_every_public_table.sql`. Paste it into the SQL
Editor and run it (option A's `db push` runs it too). What it does:

- **PostGIS:** moves it out of `public` into the `extensions` schema, which takes its
  `spatial_ref_sys` table with it. That table is the most likely culprit; nothing in the
  app uses PostGIS. If anything depends on PostGIS, the move is skipped and the app's keys
  lose access to that table instead.
- **Tables made outside the repo, if they have RLS off:** switches it on.
  - Rules a table already has are kept.
  - Tables with no rules get ones that keep what members do today:
    - chat: read as now, post and edit only as yourself, admins can remove
    - the interval timer: read only
    - everything else: your own rows only
- **Any other table with RLS off:** switches RLS on with no rules. That closes it to the
  app's keys while edge functions, which use the service key, still work. Nothing in the
  app or its edge functions reads such a table.

The last result should be an empty `still_exposed` list. The **Messages** tab shows a
line for each table it changed. Run it again any time: it changes nothing the second time.

If the result lists `spatial_ref_sys`, or the Security Advisor still flags it a day
later, contact Supabase support and ask them to move PostGIS to the `extensions` schema.

## 4. Turn on anonymous sign-ins

Dashboard → **Authentication → Sign In / Providers → Allow anonymous sign-ins** → on.

Why: a partner joins Connect with the 6-character code and PIN, without making an
account (`src/pages/Connect.tsx`). Step 2 closed the old "anyone with the app key can read
everything" access, so the partner now needs a private sign-in of their own. With this off,
joining shows "We couldn't open your private space just now."

Then **Authentication → Rate Limits**: leave "Anonymous sign-ins" at its default (30 an
hour per IP) or lower.

## 5. Deploy the edge functions

The functions in `supabase/functions` now check who is calling (`_shared/auth.ts`), and
the browser sends the member's session. Deploy all 46 so the live versions match:

```powershell
npx supabase functions deploy
```

If it asks for Docker, add `--use-api` (bundles on Supabase's side instead).
`supabase/config.toml` carries each function's `verify_jwt` setting; the deploy applies it.

Secrets: `docs/supabase-secrets.md` lists which ones each function reads. Check with
`npx supabase secrets list`.

## 6. Check it worked

```sql
-- 1) Step 1's RLS query again: expect no rows.

-- 2) Anonymous visitors see no couple's Connect data (expect 0 or a permission error).
set role anon;
select count(*) from public.connect_reflections;
reset role;

-- 3) Hidden profile fields: members can't read the table directly any more, only through the function.
select policyname, cmd from pg_policies where tablename = 'community_profiles';
select has_function_privilege('anon', 'public.get_community_profile(uuid)', 'execute') as anon_can_call;  -- false

-- 4) New tables have their rules.
select tablename, policyname, cmd from pg_policies
where tablename in ('community_blocks', 'community_reports', 'membership_grants') order by 1, 2;

-- 5) Chat rules. community_messages was made outside the repo, so check by eye:
--    reading should be limited to the group's members, writing to her own user_id.
select policyname, cmd, qual, with_check from pg_policies where tablename = 'community_messages';

-- 6) Nearby points are on the ~1 km grid (expect 0).
select count(*) from public.user_locations where fuzzed_lat <> round(fuzzed_lat::numeric, 2);

-- 7) The drip-email job targets this project.
select jobname, schedule, command like '%uinooijckvltyuggecuh%' as ours from cron.job;
```

Then **Advisors → Security Advisor**: "RLS disabled in public" should be gone.

In the app (signal.mindcast.co.nz), two phones or one normal window plus one private window:

1. **Connect:** member creates an invite, partner joins in the private window with code + PIN.
2. **Community:** block a member from chat (their messages disappear), report a message,
   then see it under **Admin → Reports**.
3. **Nearby:** shows suburbs, never a pin on a house.
4. **AI features** (journal insights, meal plan): still answer, which proves the deployed
   functions accept the member's session.
