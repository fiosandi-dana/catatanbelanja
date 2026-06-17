# 🚀 Pasar DANA — Setup Guide (Phase 0)

End-to-end bootstrap. Target time: **~15 minutes**. Everything is free-tier.

> Prereqs already on your machine: `git`, `node` (v22+), `npm`, `psql`, `deno`. All four are already installed if you cloned this repo and ran the bootstrap.

---

## 1. Supabase project (already provisioned)

- **Project ref**: `surgbsaqplqggbojklly`
- **Project URL**: `https://surgbsaqplqggbojklly.supabase.co`
- **Dashboard**: https://supabase.com/dashboard/project/surgbsaqplqggbojklly
- **Claude MCP**: `.mcp.json` at the repo root registers the Supabase MCP server scoped to this project ref — Claude Code can run migrations / queries directly once you authorize the MCP in a fresh session.

Grab the keys from **Project Settings → API**:
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-side only, never expose to client bundle)

From **Project Settings → Database → Connection string → URI**, copy the `psql` URI and replace `[YOUR-PASSWORD]` with your DB password — that's your `DATABASE_URL`.

---

## 2. Wire env vars (1 min)

```bash
cp .env.local.example .env.local
# then edit .env.local and paste the three Supabase keys

# also export DATABASE_URL in your shell for psql:
export DATABASE_URL="postgresql://postgres.[ref]:[pw]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

---

## 3. Apply schema + RLS + seed (2 min)

Run these in order. Each is idempotent — re-runnable if anything goes wrong.

```bash
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
psql "$DATABASE_URL" -f supabase/migrations/0001a_rls.sql
psql "$DATABASE_URL" -f supabase/seed.sql
psql "$DATABASE_URL" -f supabase/migrations/0003_sku_registry_100.sql
```

Verify:
```bash
psql "$DATABASE_URL" -c "select count(*) from cities;"   # → 16
psql "$DATABASE_URL" -c "select count(*) from skus;"     # → 25
psql "$DATABASE_URL" -c "select count(*) from price_snapshots;"  # → 0 (about to fill)
```

---

## 4. Push the historical PIHPS backfill (1 min)

```bash
psql "$DATABASE_URL" -f pihps-backfill.sql
```

Verify (should be 24,177 rows):
```bash
psql "$DATABASE_URL" -c "select count(*) from price_snapshots;"
psql "$DATABASE_URL" -c "select snapshot_date, count(*) from price_snapshots group by 1 order by 1 desc limit 5;"
```

---

## 5. Deploy the daily scraper Edge Function (3 min)

Install Supabase CLI if you don't have it:
```bash
brew install supabase/tap/supabase
supabase login
supabase link --project-ref <your-project-ref>  # the ref is in the Project URL
```

Generate a cron secret and store it three places:
```bash
CRON_SECRET=$(openssl rand -hex 32)
echo "CRON_SECRET=$CRON_SECRET"  # save this — you need it for steps below
```

Deploy the function and set the secret:
```bash
supabase functions deploy scrape-pihps --no-verify-jwt
supabase secrets set CRON_SECRET="$CRON_SECRET"
```

Smoke-test it:
```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/scrape-pihps" \
  -H "Authorization: Bearer $CRON_SECRET"
# expect: {"ok":true,"snapshot_date":"YYYY-MM-DD","scraped":N,"skipped":N,"failures":0}
```

---

## 6. Schedule the daily cron (1 min)

Open Supabase **SQL Editor** and run:

```sql
-- Set the two settings used by the cron job
alter database postgres set app.supabase_url = 'https://surgbsaqplqggbojklly.supabase.co';
alter database postgres set app.cron_secret  = '<paste CRON_SECRET from step 5>';
```

Then apply the cron migration:
```bash
psql "$DATABASE_URL" -f supabase/migrations/0002_pihps_cron.sql
```

Verify:
```bash
psql "$DATABASE_URL" -c "select jobname, schedule, active from cron.job;"
# expect one row: scrape-pihps-daily | 0 1 * * * | t
```

The scraper now fires every day at **08:00 WIB** (01:00 UTC). The first run tomorrow will append today+1's prices to `price_snapshots`.

---

## 7. Run the Next.js app locally (1 min)

```bash
cd web
npm install      # already done if you bootstrapped
npm run dev
# open http://localhost:3000
```

You'll see the Beranda with mock data for now. Wiring it to real Supabase data is the next dev slice (see `BUILD_PLAN.md` and the `pasar-frontend` agent).

---

## 8. Vercel deployment (already provisioned)

- **Vercel project**: https://vercel.com/dana-initiatives/catatanbelanja (team: `dana-initiatives`)
- **GitHub source**: `fiosandi-dana/catatanbelanja` (`main` auto-deploys)
- **Root directory** in Vercel project settings: `web`
- **Env vars to set** (Vercel → Project → Settings → Environment Variables):
  - `NEXT_PUBLIC_SUPABASE_URL` = `https://surgbsaqplqggbojklly.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (from Supabase Project Settings → API)
  - `SUPABASE_SERVICE_ROLE_KEY` = (from same place — Server-side only env scope)

Push to `main` → Vercel auto-builds and deploys to a preview URL plus production at `catatanbelanja.vercel.app` (or the `dana-initiatives` team-scoped equivalent).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `psql: error: password authentication failed` | Re-grab the password from Supabase dashboard → Settings → Database → Reset password. |
| `relation "price_snapshots" does not exist` | Migrations weren't applied. Re-run step 3 in order. |
| Cron isn't firing | Check `select * from cron.job_run_details order by start_time desc limit 5;` — look for HTTP errors. Verify `app.supabase_url` and `app.cron_secret` are set: `show app.supabase_url;`. |
| Edge Function returns 401 | The `CRON_SECRET` in Supabase secrets doesn't match the one in `app.cron_secret`. Re-do step 5 and 6 carefully. |
| Edge Function returns 500 | Check Supabase Studio → Edge Functions → scrape-pihps → Logs. Most likely PIHPS upstream is down — re-run tomorrow. |
| Backfill SQL apply hangs | The file is 1.4MB / 119 INSERT statements — should finish in <30s. If hanging, kill and check `select pg_stat_activity;`. |

---

## What's next

- `BUILD_PLAN.md` §6 → DANA Mini Program port (blocked on PT/CV)
- Wire Beranda to read from `price_snapshots` (next dev slice — see `web/app/page.tsx`)
- City picker bottom sheet
- Catat flow: bottom-sheet quick-add + state machine wiring
- Insight monthly aggregation Edge Function

See `PRD.md` §6 for the open architectural decisions, and `BUILD_PLAN.md` §8 for product-level open questions.
