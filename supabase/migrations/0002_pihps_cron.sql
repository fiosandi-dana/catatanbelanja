-- =============================================================================
-- 0002_pihps_cron.sql — schedule the PIHPS daily scrape
--
-- Runs once per day at 01:00 UTC (08:00 WIB), invoking the Edge Function via
-- pg_net. Idempotent within the function (INSERT ... ON CONFLICT DO NOTHING),
-- so a re-fired cron job has no side effects.
--
-- Auth + endpoint URL are read from Postgres GUC settings so this migration
-- contains zero secrets. Run the setup block at the bottom (with real values)
-- once per environment after applying the migration.
-- =============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ---------------------------------------------------------------------------
-- Re-schedulable: unschedule any prior copy of this job before re-creating it
-- so this migration stays idempotent across re-runs.
-- ---------------------------------------------------------------------------
do $$
declare
  jid bigint;
begin
  select jobid into jid from cron.job where jobname = 'scrape-pihps-daily';
  if jid is not null then
    perform cron.unschedule(jid);
  end if;
end $$;

select cron.schedule(
  'scrape-pihps-daily',
  '0 1 * * *',  -- 01:00 UTC = 08:00 WIB, every day
  $cron$
    select net.http_post(
      url     := current_setting('app.supabase_url') || '/functions/v1/scrape-pihps',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || current_setting('app.cron_secret')
      ),
      body         := '{}'::jsonb,
      timeout_milliseconds := 60000
    );
  $cron$
);

-- =============================================================================
-- One-time setup — RUN MANUALLY in the Supabase SQL editor after applying
-- this migration. These ALTERs persist across connections and are read by
-- the cron-scheduled SQL above via current_setting().
--
-- Generate a fresh CRON_SECRET with:
--   openssl rand -hex 32
-- Then also set the same value in the Supabase Dashboard at
--   Functions → scrape-pihps → Secrets → CRON_SECRET
-- so the Edge Function and the cron caller agree on it.
--
-- ---------------------------------------------------------------------------
-- alter database postgres set app.supabase_url = 'https://<project-ref>.supabase.co';
-- alter database postgres set app.cron_secret  = '<paste-openssl-output-here>';
--
-- -- Verify the cron job is registered:
-- select jobid, schedule, command from cron.job where jobname = 'scrape-pihps-daily';
--
-- -- Manually trigger the next run for testing (returns immediately;
-- -- pg_net is fire-and-forget — check Functions logs in Studio):
-- select net.http_post(
--   url     := current_setting('app.supabase_url') || '/functions/v1/scrape-pihps',
--   headers := jsonb_build_object(
--     'Content-Type',  'application/json',
--     'Authorization', 'Bearer ' || current_setting('app.cron_secret')
--   ),
--   body    := '{}'::jsonb
-- );
-- =============================================================================
