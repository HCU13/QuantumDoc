-- Scheduled sweep: expires_at geçmiş ama hâlâ 'active' görünen user_subscriptions satırlarını
-- 'expired'a çeker. RevenueCat webhook kaçırma / product_id uyuşmazlığı gibi durumlar için güvenlik ağı.

create extension if not exists pg_cron;

create or replace function public.sweep_expired_subscriptions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  update public.user_subscriptions
     set subscription_type   = 'free',
         subscription_status = 'expired',
         updated_at          = now()
   where subscription_status in ('active', 'cancelled')
     and subscription_type   = 'premium'
     and expires_at is not null
     and expires_at < now();

  get diagnostics affected = row_count;
  return affected;
end;
$$;

revoke all on function public.sweep_expired_subscriptions() from public, anon, authenticated;

-- Her saatin 7. dakikasında çalıştır
select cron.schedule(
  'sweep-expired-subscriptions',
  '7 * * * *',
  $$select public.sweep_expired_subscriptions();$$
);
