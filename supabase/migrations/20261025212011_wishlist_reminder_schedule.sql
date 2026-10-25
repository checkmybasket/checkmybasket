create extension if not exists pg_net;
create extension if not exists pg_cron;
alter table personal_wishlist.reminder_worker add column endpoint text;

-- Called by the deployer only. A random scoped token is generated inside the DB;
-- it is never committed, printed, placed in the browser or copied into Edge env.
create function personal_wishlist.configure_reminder_worker(p_project_url text) returns void
language plpgsql security invoker set search_path='' as $$
declare raw text := encode(extensions.gen_random_bytes(32),'hex'); secret_id uuid;
begin
 if p_project_url !~ '^https://[a-z]{20}\.supabase\.co$' and p_project_url<>'http://kong:8000' then raise exception 'Invalid project URL'; end if;
 select id into secret_id from vault.secrets where name='wishlist_reminder_worker';
 if secret_id is null then perform vault.create_secret(raw,'wishlist_reminder_worker');
 else perform vault.update_secret(secret_id,raw); end if;
 insert into personal_wishlist.reminder_worker(singleton,token_hash,endpoint)
 values(true,encode(extensions.digest(raw,'sha256'),'hex'),p_project_url||'/functions/v1/wishlist-reminders')
 on conflict(singleton) do update set token_hash=excluded.token_hash,endpoint=excluded.endpoint;
end; $$;
create function personal_wishlist.dispatch_reminder_worker() returns bigint
language plpgsql security invoker set search_path='' as $$
declare target text; token text;
begin
 select endpoint into target from personal_wishlist.reminder_worker;
 if target is null then return null; end if;
 select decrypted_secret into token from vault.decrypted_secrets where name='wishlist_reminder_worker';
 return net.http_post(url:=target,headers:=jsonb_build_object('Content-Type','application/json','x-wishlist-worker-token',token),body:='{}'::jsonb,timeout_milliseconds:=60000);
end; $$;
revoke all on function personal_wishlist.configure_reminder_worker(text),personal_wishlist.dispatch_reminder_worker() from public,anon,authenticated,service_role;
select cron.schedule('wishlist-occasion-reminders','0 9-19 * * *','select personal_wishlist.dispatch_reminder_worker();');
select cron.schedule('wishlist-reminder-retention','20 3 * * *',$$delete from personal_wishlist.reminder_jobs where event_date<current_date-90;$$);
