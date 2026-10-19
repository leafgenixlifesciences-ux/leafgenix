-- Admin-owned devices only. Subscription endpoints are capability URLs, so
-- never expose this table through an anon/authenticated PostgREST policy.
create table if not exists public.admin_push_subscriptions (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_push_subscriptions enable row level security;
revoke all on table public.admin_push_subscriptions from anon, authenticated;
