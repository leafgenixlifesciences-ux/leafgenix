# Database

The schema for this project used to live only in the Supabase dashboard. It is
now tracked here, so the thing that actually enforces the security boundary can
be reviewed in a diff like everything else.

```
migrations/
  20260811000000_initial_schema.sql   baseline, reconstructed by introspection
  20260908000000_idempotent_stock_movement_and_hardening.sql
```

## Verify the baseline

The baseline was reconstructed from the live project rather than dumped, so
confirm it against the source of truth once before trusting it for a rebuild:

```bash
supabase link --project-ref ypjqsledcqqqhfghtpsg
supabase db pull          # writes the authoritative dump
supabase migration list   # local vs remote
```

## Rules that are easy to get wrong

- **`orders` and `order_items` have no INSERT or UPDATE policy.** That is
  deliberate. They are written only by the service-role key from route
  handlers, never from the browser. Adding a write policy here would let a
  customer author their own order.
- **`contact_messages` has RLS enabled and no policy at all.** Also
  deliberate: deny-all, service role only. The Supabase linter reports this as
  `rls_enabled_no_policy`; it is the intent, not an oversight.
- **`decrement_stock_for_order` / `restock_for_order` must stay idempotent.**
  Two callers race on every single order - the browser's `/verify` and
  Razorpay's webhook. The conditional `update ... where stock_decremented_at
  is null` inside each function is the only thing that stops stock moving
  twice. Do not "simplify" it into a plain UPDATE.

## Still to do by hand

- **Turn on leaked-password protection.** Dashboard -> Authentication ->
  Policies -> Password security -> enable the HaveIBeenPwned check. It is off
  by default and cannot be set from a migration.
- **Sweep abandoned orders.** Rows sit at `created`/`pending` forever when a
  customer opens checkout and walks away. A scheduled job keeps the table
  honest (`orders_unpaid_created_idx` exists for it):

  ```sql
  update public.orders
     set status = 'cancelled',
         failure_reason = 'Abandoned at checkout'
   where status in ('created', 'pending')
     and created_at < now() - interval '24 hours';
  ```

  Run it from Supabase -> Integrations -> Cron, daily.
