-- Track paid-order transactional email delivery. Resend idempotency keys stop
-- the normal /verify + webhook race from producing duplicate messages, while
-- these durable timestamps prevent a webhook retry days later from resending.
alter table public.orders
  add column if not exists customer_confirmation_email_sent_at timestamptz,
  add column if not exists admin_notification_email_sent_at timestamptz;

-- Existing fulfilled orders pre-date transactional email support. Mark them as
-- handled so an old Razorpay retry cannot unexpectedly email them at launch.
update public.orders
   set customer_confirmation_email_sent_at = coalesce(
         customer_confirmation_email_sent_at,
         updated_at,
         created_at
       ),
       admin_notification_email_sent_at = coalesce(
         admin_notification_email_sent_at,
         updated_at,
         created_at
       )
 where status in ('paid', 'processing', 'shipped', 'delivered', 'refunded');
