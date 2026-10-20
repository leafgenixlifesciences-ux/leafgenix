-- Admin-created coupons, auditable redemptions and opt-in marketing.
create table if not exists public.coupons (
  code text primary key check (code ~ '^[A-Z0-9_-]{4,32}$'),
  discount_percent smallint not null check (discount_percent between 1 and 80),
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

insert into public.coupons (code, discount_percent, active)
values ('LEAF10', 10, true)
on conflict (code) do nothing;

alter table public.orders add column if not exists coupon_code text;
update public.orders
set coupon_code = substring(notes from 'Coupon: ([A-Z0-9_-]+)')
where coupon_code is null and notes ~ 'Coupon: [A-Z0-9_-]+';
create index if not exists orders_coupon_status_idx on public.orders (coupon_code, status)
  where coupon_code is not null;

create table if not exists public.marketing_subscribers (
  email text primary key,
  name text not null,
  consent_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  unsubscribe_token uuid not null unique default gen_random_uuid()
);

-- The welcome form stored affirmative consent in these exact records before
-- a dedicated subscribers table existed. Ordinary contact enquiries are not imported.
insert into public.marketing_subscribers (email, name, consent_at)
select distinct on (lower(email)) lower(email), name, created_at
from public.contact_messages
where subject like 'Coupon lead%' and message ilike '%consented to promotional email%'
order by lower(email), created_at desc
on conflict (email) do nothing;

create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.marketing_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.marketing_campaigns(id) on delete cascade,
  email text not null,
  name text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'skipped')),
  error text,
  sent_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (campaign_id, email)
);
create index if not exists marketing_deliveries_campaign_status_idx
  on public.marketing_deliveries (campaign_id, status);

alter table public.coupons enable row level security;
alter table public.marketing_subscribers enable row level security;
alter table public.marketing_campaigns enable row level security;
alter table public.marketing_deliveries enable row level security;
-- No client policies: all writes/reads go through checked server routes.
