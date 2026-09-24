-- ---------------------------------------------------------------------------
-- Baseline schema for leafgenix.in
--
-- Reconstructed from the live project (ypjqsledcqqqhfghtpsg) by introspection,
-- because the schema had until now only ever existed in the Supabase
-- dashboard. It is the starting point every later migration builds on.
--
-- Verify against the source of truth before relying on it for a rebuild:
--   supabase link --project-ref ypjqsledcqqqhfghtpsg
--   supabase db pull
-- ---------------------------------------------------------------------------

create extension if not exists pgcrypto;

-- --------------------------------------------------------------- types ----
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum (
      'created', 'pending', 'paid', 'failed', 'processing',
      'shipped', 'delivered', 'cancelled', 'refunded'
    );
  end if;
end
$$;

create sequence if not exists public.order_number_seq;

-- -------------------------------------------------------------- tables ----

create table if not exists public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.products (
  id uuid default gen_random_uuid() not null primary key,
  slug text not null unique,
  name text not null,
  tagline text,
  category text default 'General Wellness'::text not null,
  form text,
  pack_size text,
  short_description text,
  description text,
  composition text,
  key_benefits text[] default '{}'::text[] not null,
  ingredients text[] default '{}'::text[] not null,
  uses text[] default '{}'::text[] not null,
  directions text,
  safety_info text,
  faqs jsonb default '[]'::jsonb not null,
  specifications jsonb default '[]'::jsonb not null,
  differentiators jsonb default '[]'::jsonb not null,
  nutrition jsonb default '[]'::jsonb not null,
  evidence jsonb default '[]'::jsonb not null,
  price_paise integer not null check (price_paise >= 0),
  mrp_paise integer not null check (mrp_paise >= 0),
  gst_rate numeric(5,2) default 12.00 not null,
  hsn_code text,
  stock integer default 100 not null check (stock >= 0),
  image_url text,
  gallery text[] default '{}'::text[] not null,
  rating numeric(2,1) default 4.6,
  review_count integer default 0,
  is_active boolean default true not null,
  is_featured boolean default false not null,
  sort_order integer default 0 not null,
  flavour text,
  fssai_no text,
  shelf_life text,
  badge text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.rx_products (
  id uuid default gen_random_uuid() not null primary key,
  slug text not null unique,
  name text not null,
  composition text not null,
  form text,
  therapy_area text not null,
  indications text[] default '{}'::text[] not null,
  accent_hex text,
  sort_order integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null
);

create table if not exists public.orders (
  id uuid default gen_random_uuid() not null primary key,
  order_number text not null unique default (
    ('LG' || to_char((now() at time zone 'Asia/Kolkata'), 'YYMM'))
    || lpad(nextval('public.order_number_seq')::text, 5, '0')
  ),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  phone text not null,
  full_name text not null,
  shipping_address jsonb not null,
  subtotal_paise integer default 0 not null,
  shipping_paise integer default 0 not null,
  discount_paise integer default 0 not null,
  total_paise integer default 0 not null,
  status public.order_status default 'created'::public.order_status not null,
  razorpay_order_id text unique,
  razorpay_payment_id text,
  razorpay_signature text,
  payment_method text,
  failure_reason text,
  tracking_number text,
  courier_name text,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.order_items (
  id uuid default gen_random_uuid() not null primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_slug text not null,
  product_image text,
  unit_price_paise integer not null,
  quantity integer not null check (quantity > 0),
  total_paise integer not null
);

create table if not exists public.contact_messages (
  id uuid default gen_random_uuid() not null primary key,
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  handled boolean default false not null,
  created_at timestamptz default now() not null
);

-- ------------------------------------------------------------- indexes ----

create index if not exists products_active_idx    on public.products (is_active, sort_order);
create index if not exists products_slug_idx      on public.products (slug);
create index if not exists rx_products_active_idx on public.rx_products (is_active, sort_order);
create index if not exists orders_user_idx        on public.orders (user_id, created_at desc);
create index if not exists orders_rzp_idx         on public.orders (razorpay_order_id);
create index if not exists orders_status_idx      on public.orders (status, created_at desc);
create index if not exists order_items_order_idx  on public.order_items (order_id);

-- ----------------------------------------------------------- functions ----

create or replace function public.set_updated_at()
returns trigger language plpgsql security definer set search_path to '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path to '' as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger orders_set_updated_at   before update on public.orders
  for each row execute function public.set_updated_at();
create trigger on_auth_user_created    after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------- row level sec ----
--
-- Every table is deny-by-default. The catalogue is world-readable when
-- active; a customer sees only their own profile and their own orders.
-- Orders are never written through RLS - only the service-role key in
-- src/lib/supabase/admin.ts writes them, from route handlers.
--
-- contact_messages has RLS on and NO policy on purpose: nothing but the
-- service role may read or write it. The Supabase linter flags this as
-- "RLS enabled, no policy"; here that is the intent, not an oversight.

alter table public.profiles         enable row level security;
alter table public.products         enable row level security;
alter table public.rx_products      enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;
alter table public.contact_messages enable row level security;

create policy products_public_read on public.products
  for select to anon, authenticated using (is_active = true);

create policy rx_products_public_read on public.rx_products
  for select to anon, authenticated using (is_active = true);

create policy profiles_select_own on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

create policy profiles_insert_own on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

create policy profiles_update_own on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy orders_select_own on public.orders
  for select to authenticated using ((select auth.uid()) = user_id);

create policy order_items_select_own on public.order_items
  for select to authenticated using (
    exists (
      select 1 from public.orders o
       where o.id = order_items.order_id
         and o.user_id = (select auth.uid())
    )
  );
