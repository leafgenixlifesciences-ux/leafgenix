-- ---------------------------------------------------------------------------
-- Idempotent stock movement, plus a few pieces of hardening.
--
-- The problem this fixes: decrement_stock_for_order used to be an
-- unconditional `stock = stock - quantity`. Both /api/razorpay/verify (the
-- browser's fast path) and /api/razorpay/webhook (Razorpay's authoritative
-- one) call it, and in the normal flow they fire within milliseconds of each
-- other. Each read the order status and then wrote - a read-then-write with
-- nothing atomic in between - so both passed the "still unpaid" check and both
-- decremented. Stock came off twice for a single order, on most orders.
--
-- The fix is to make the claim itself the lock: a conditional UPDATE that only
-- one caller can win, inside the function.
-- ---------------------------------------------------------------------------

-- 1. Track whether stock has already moved for an order.
alter table public.orders
  add column if not exists stock_decremented_at timestamptz;

-- Orders already paid before this migration have had their stock taken. Mark
-- them, so a later webhook retry does not decrement them a second time.
update public.orders
   set stock_decremented_at = coalesce(updated_at, created_at)
 where stock_decremented_at is null
   and status in ('paid', 'processing', 'shipped', 'delivered');

-- 2. Idempotent decrement. Returns true only for the caller that did the work.
drop function if exists public.decrement_stock_for_order(uuid);

create function public.decrement_stock_for_order(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_claimed uuid;
begin
  update public.orders
     set stock_decremented_at = now()
   where id = p_order_id
     and stock_decremented_at is null
  returning id into v_claimed;

  if v_claimed is null then
    return false;   -- already decremented by an earlier call
  end if;

  update public.products p
     set stock = greatest(0, p.stock - oi.quantity)
    from public.order_items oi
   where oi.order_id = p_order_id
     and oi.product_id = p.id;

  return true;
end;
$function$;

-- 3. Idempotent restock, for when a payment is refunded.
create or replace function public.restock_for_order(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_claimed uuid;
begin
  update public.orders
     set stock_decremented_at = null
   where id = p_order_id
     and stock_decremented_at is not null
  returning id into v_claimed;

  if v_claimed is null then
    return false;   -- nothing to give back
  end if;

  update public.products p
     set stock = p.stock + oi.quantity
    from public.order_items oi
   where oi.order_id = p_order_id
     and oi.product_id = p.id;

  return true;
end;
$function$;

-- 4. Both are service-role-only entry points, called from route handlers.
--    Nothing on the public PostgREST surface should reach them.
revoke all on function public.decrement_stock_for_order(uuid) from public, anon, authenticated;
revoke all on function public.restock_for_order(uuid)          from public, anon, authenticated;

-- 5. These two are trigger bodies, but being SECURITY DEFINER and in the
--    public schema made them callable at /rest/v1/rpc/ by any anonymous
--    visitor. Calling them out of trigger context errors, so the exposure was
--    minor - but there is no reason to leave the door open.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at()  from public, anon, authenticated;

-- 6. The refund branch of the webhook looks orders up by payment id, which had
--    no index behind it.
create index if not exists orders_rzp_payment_idx
  on public.orders (razorpay_payment_id)
  where razorpay_payment_id is not null;

-- 7. Supports sweeping abandoned orders (see supabase/README.md).
create index if not exists orders_unpaid_created_idx
  on public.orders (created_at)
  where status in ('created', 'pending');
