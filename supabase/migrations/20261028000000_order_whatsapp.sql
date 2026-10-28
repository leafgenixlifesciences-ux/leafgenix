alter table public.orders
  add column if not exists whatsapp_consent boolean not null default false,
  add column if not exists whatsapp_consented_at timestamptz;

create table if not exists public.order_whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_key text not null,
  recipient text not null check (recipient in ('customer', 'admin')),
  message_id text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (order_id, event_key, recipient)
);

alter table public.order_whatsapp_messages enable row level security;
revoke all on public.order_whatsapp_messages from anon, authenticated;
