-- Gift Predictions 48-hour auto-close (Game Replacement Brief, "How It Works"):
-- a round left open for 48 hours is revealed with whoever has submitted.

create extension if not exists pg_cron;

create or replace function public.auto_close_stale_prediction_rounds()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.prediction_rounds
     set status = 'revealed',
         closed_at = now()
   where status = 'open'
     and created_at < now() - interval '48 hours';
$$;

-- cron runs as postgres; no client role may call this directly
revoke all on function public.auto_close_stale_prediction_rounds() from public, anon, authenticated;

select cron.schedule(
  'auto_close_prediction_rounds',
  '7 * * * *',
  $$select public.auto_close_stale_prediction_rounds()$$
);
