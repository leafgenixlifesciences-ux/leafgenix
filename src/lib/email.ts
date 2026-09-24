import { formatPaise } from "@/lib/money";
import { COUPON } from "@/lib/offer";
import { site } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderItem, ShippingAddress } from "@/lib/types";
import { siteUrl } from "@/lib/utils";

type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  idempotencyKey: string;
  replyTo?: string;
};

type ContactEmailInput = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
};

type CouponEmailInput = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

type OrderEmailRow = {
  id: string;
  order_number: string;
  email: string;
  phone: string;
  full_name: string;
  shipping_address: ShippingAddress;
  subtotal_paise: number;
  shipping_paise: number;
  discount_paise: number;
  total_paise: number;
  razorpay_payment_id: string | null;
  payment_method: string | null;
  created_at: string;
  customer_confirmation_email_sent_at: string | null;
  admin_notification_email_sent_at: string | null;
  order_items: OrderItem[];
};

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[
        char
      ] ?? char,
  );
}

function adminEmail(): string {
  return (
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.LEAD_NOTIFICATION_EMAIL ||
    site.email
  );
}

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

async function sendEmail(message: EmailMessage): Promise<void> {
  if (!emailConfigured()) {
    throw new Error("RESEND_API_KEY or RESEND_FROM_EMAIL is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": message.idempotencyKey.slice(0, 256),
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to: [message.to],
      reply_to: message.replyTo,
      subject: message.subject,
      html: message.html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend returned ${response.status}: ${await response.text()}`);
  }
}

function shell(content: string, preheader: string): string {
  const markUrl = siteUrl("/leafgenix-mark.png");
  return `<!doctype html>
  <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="color-scheme" content="light">
      <style>
        @media only screen and (max-width: 600px) {
          .email-outer { padding: 0 !important; }
          .email-card { border-radius: 0 !important; border-left: 0 !important; border-right: 0 !important; }
          .email-header { padding: 22px 20px !important; }
          .email-body { padding: 26px 20px !important; }
          .email-footer { padding: 18px 20px !important; }
          .email-brand { font-size: 17px !important; }
          .email-mark { width: 46px !important; height: 46px !important; }
          h1 { font-size: 25px !important; }
        }
      </style>
    </head>
    <body style="margin:0;background:#f3f1e8;font-family:Arial,sans-serif;color:#163126">
      <span style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</span>
      <table class="email-outer" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f1e8;padding:32px 12px">
        <tr><td align="center">
          <table class="email-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #dce4dc;border-top:5px solid #c9e82d;border-radius:22px;overflow:hidden;box-shadow:0 18px 55px rgba(15,54,36,.12)">
            <tr><td class="email-header" style="background-color:#004f2a;background-image:linear-gradient(120deg,#003d24 0%,#006837 70%,#315f24 100%);padding:24px 30px;color:#ffffff">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="58" valign="middle">
                    <div class="email-mark" style="width:50px;height:50px;border-radius:50%;background:#ffffff;text-align:center;overflow:hidden">
                      <img src="${escapeHtml(markUrl)}" width="50" height="50" alt="" style="display:block;width:50px;height:50px;object-fit:contain">
                    </div>
                  </td>
                  <td valign="middle" style="padding-left:13px">
                    <div class="email-brand" style="font-size:19px;line-height:1.1;font-weight:800;letter-spacing:-.02em">Leaf Genix Lifesciences</div>
                    <div style="margin-top:5px;font-size:11px;line-height:1.3;color:#d7e9dd">Lifting and Empowering All Families</div>
                  </td>
                </tr>
              </table>
            </td></tr>
            <tr><td class="email-body" style="padding:34px 32px">${content}</td></tr>
            <tr><td class="email-footer" style="padding:20px 30px;background:#f4f7f2;border-top:1px solid #dfe7df;font-size:12px;line-height:1.7;color:#64756c">
              <strong style="color:#315544">Need a hand?</strong> Reply to this email or contact<br>
              <a href="mailto:${escapeHtml(site.email)}" style="color:#005c2d;text-decoration:none">${escapeHtml(site.email)}</a>
              &nbsp;·&nbsp;
              <a href="tel:${escapeHtml(site.supportPhone.replace(/\s/g, ""))}" style="color:#005c2d;text-decoration:none">${escapeHtml(site.supportPhone)}</a>
            </td></tr>
          </table>
          <div style="max-width:600px;padding:16px 18px 0;font-size:11px;line-height:1.6;color:#829087;text-align:center">
            ${escapeHtml(site.fullName)} · Jaipur, Rajasthan<br>
            This email relates to your enquiry, coupon request, or order.
          </div>
        </td></tr>
      </table>
    </body>
  </html>`;
}

export async function sendContactEmails(input: ContactEmailInput): Promise<void> {
  const subject = input.subject || "Website enquiry";
  const phoneRow = input.phone
    ? `<p style="margin:6px 0"><strong>Phone:</strong> ${escapeHtml(input.phone)}</p>`
    : "";

  const customerHtml = shell(
    `<p style="margin:0 0 8px;color:#66756d">Hi ${escapeHtml(input.name)},</p>
     <h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;color:#005c2d">We received your message</h1>
     <p style="margin:0 0 18px;line-height:1.7">Thank you for contacting ${escapeHtml(site.fullName)}. Our customer care team will reply within one working day.</p>
     <div style="padding:16px 18px;border-radius:12px;background:#f4f7f2;border-left:4px solid #c9e82d">
       <div style="font-weight:700;margin-bottom:7px">${escapeHtml(subject)}</div>
       <div style="white-space:pre-wrap;line-height:1.6;color:#506158">${escapeHtml(input.message)}</div>
     </div>`,
    "We received your Leaf Genix enquiry.",
  );

  const adminHtml = shell(
    `<h1 style="margin:0 0 18px;font-size:26px;color:#005c2d">New website enquiry</h1>
     <p style="margin:6px 0"><strong>Name:</strong> ${escapeHtml(input.name)}</p>
     <p style="margin:6px 0"><strong>Email:</strong> ${escapeHtml(input.email)}</p>
     ${phoneRow}
     <p style="margin:6px 0 18px"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
     <div style="padding:16px 18px;border-radius:12px;background:#f4f7f2;white-space:pre-wrap;line-height:1.6">${escapeHtml(input.message)}</div>
     <p style="margin:18px 0 0;color:#66756d;font-size:13px">Reply directly to this email to answer the customer.</p>`,
    `New enquiry from ${input.name}`,
  );

  await Promise.all([
    sendEmail({
      to: input.email,
      replyTo: site.email,
      subject: `We received your message · ${site.name}`,
      html: customerHtml,
      idempotencyKey: `contact-customer/${input.id}`,
    }),
    sendEmail({
      to: adminEmail(),
      replyTo: input.email,
      subject: `New website enquiry — ${subject}`,
      html: adminHtml,
      idempotencyKey: `contact-admin/${input.id}`,
    }),
  ]);
}

export async function sendCouponEmails(input: CouponEmailInput): Promise<void> {
  const code = escapeHtml(COUPON.code);
  const customerHtml = shell(
    `<p style="margin:0 0 8px;color:#66756d">Hi ${escapeHtml(input.name)},</p>
     <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;color:#005c2d">Your welcome gift is ready.</h1>
     <p style="margin:0 0 22px;line-height:1.7">Use this code at checkout for ${COUPON.percent}% off your first Leaf Genix order.</p>
     <div style="padding:22px;border:1px dashed #8ba33b;border-radius:16px;background:#f6f9e8;text-align:center">
       <div style="font-size:11px;letter-spacing:.12em;color:#66756d">Your coupon code</div>
       <div style="margin-top:7px;font-size:34px;line-height:1;font-weight:800;letter-spacing:.08em;color:#005c2d">${code}</div>
     </div>
     <p style="margin:22px 0 0;text-align:center"><a href="${escapeHtml(siteUrl("/products"))}" style="display:inline-block;padding:13px 20px;border-radius:999px;background:#005c2d;color:#ffffff;text-decoration:none;font-weight:700">Explore the range</a></p>`,
    `Your ${COUPON.percent}% Leaf Genix coupon is ${COUPON.code}.`,
  );

  const adminHtml = shell(
    `<h1 style="margin:0 0 10px;font-size:28px;color:#005c2d">New welcome-coupon lead</h1>
     <p style="margin:0 0 22px;color:#66756d">A visitor claimed the ${COUPON.percent}% welcome offer.</p>
     <div style="padding:18px;border-radius:14px;background:#f4f7f2;line-height:1.8">
       <strong>${escapeHtml(input.name)}</strong><br>
       ${escapeHtml(input.email)}<br>
       +91 ${escapeHtml(input.phone)}
     </div>
     <p style="margin:18px 0 0;font-size:13px;color:#66756d">Coupon issued: <strong style="color:#005c2d">${code}</strong></p>`,
    `New coupon lead from ${input.name}`,
  );

  await Promise.all([
    sendEmail({
      to: input.email,
      replyTo: site.email,
      subject: `Your ${COUPON.percent}% Leaf Genix coupon`,
      html: customerHtml,
      idempotencyKey: `coupon-customer/${input.id}`,
    }),
    sendEmail({
      to: adminEmail(),
      replyTo: input.email,
      subject: `New ${COUPON.percent}% coupon lead — ${input.name}`,
      html: adminHtml,
      idempotencyKey: `coupon-admin/${input.id}`,
    }),
  ]);
}

function orderItemsHtml(items: OrderItem[]): string {
  return items
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #e8ece8">
          <strong>${escapeHtml(item.product_name)}</strong><br>
          <span style="font-size:12px;color:#6d7b73">Qty ${item.quantity} × ${escapeHtml(formatPaise(item.unit_price_paise))}</span>
        </td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #e8ece8;font-weight:700">${escapeHtml(formatPaise(item.total_paise))}</td>
      </tr>`,
    )
    .join("");
}

function addressHtml(address: ShippingAddress): string {
  return [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.pincode}`,
    address.country,
  ]
    .filter(Boolean)
    .map((line) => escapeHtml(String(line)))
    .join("<br>");
}

function totalsHtml(order: OrderEmailRow): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;font-size:14px">
    <tr><td style="padding:4px 0;color:#66756d">Subtotal</td><td align="right">${escapeHtml(formatPaise(order.subtotal_paise))}</td></tr>
    ${order.discount_paise > 0 ? `<tr><td style="padding:4px 0;color:#66756d">Coupon saving</td><td align="right" style="color:#005c2d">−${escapeHtml(formatPaise(order.discount_paise))}</td></tr>` : ""}
    <tr><td style="padding:4px 0;color:#66756d">Delivery</td><td align="right">${order.shipping_paise === 0 ? "Free" : escapeHtml(formatPaise(order.shipping_paise))}</td></tr>
    <tr><td style="padding:12px 0 0;font-size:17px;font-weight:700">Total paid</td><td align="right" style="padding:12px 0 0;font-size:17px;font-weight:700">${escapeHtml(formatPaise(order.total_paise))}</td></tr>
  </table>`;
}

export async function sendPaidOrderEmails(orderId: string): Promise<void> {
  if (!emailConfigured()) {
    throw new Error("Order email delivery is not configured");
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select(`
      id, order_number, email, phone, full_name, shipping_address,
      subtotal_paise, shipping_paise, discount_paise, total_paise,
      razorpay_payment_id, payment_method, created_at,
      customer_confirmation_email_sent_at, admin_notification_email_sent_at,
      order_items (*)
    `)
    .eq("id", orderId)
    .eq("status", "paid")
    .single();

  if (error || !data) {
    throw new Error(`Could not load paid order for email: ${error?.message ?? orderId}`);
  }

  const order = data as unknown as OrderEmailRow;
  const details = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${orderItemsHtml(order.order_items)}</table>${totalsHtml(order)}`;
  const orderUrl = siteUrl(`/order/${order.id}`);
  const paymentRef = order.razorpay_payment_id
    ? `<p style="margin:6px 0"><strong>Payment ID:</strong> ${escapeHtml(order.razorpay_payment_id)}</p>`
    : "";

  const deliveries: Promise<void>[] = [];

  if (!order.customer_confirmation_email_sent_at) {
    deliveries.push(
      sendEmail({
        to: order.email,
        replyTo: site.email,
        subject: `Order ${order.order_number} confirmed · ${site.name}`,
        idempotencyKey: `paid-order-customer/${order.id}`,
        html: shell(
          `<p style="margin:0 0 8px;color:#66756d">Hi ${escapeHtml(order.full_name)},</p>
           <h1 style="margin:0 0 10px;font-size:28px;color:#005c2d">Payment received. Order confirmed.</h1>
           <p style="margin:0 0 22px;line-height:1.7">Thank you for your order <strong>${escapeHtml(order.order_number)}</strong>. We are preparing it for dispatch and will share tracking details when it ships.</p>
           ${details}
           <div style="margin-top:22px;padding:16px 18px;border-radius:12px;background:#f4f7f2;line-height:1.6">
             <strong>Delivering to</strong><br>${addressHtml(order.shipping_address)}<br>Phone: +91 ${escapeHtml(order.phone)}
           </div>
           <p style="margin:24px 0 0"><a href="${escapeHtml(orderUrl)}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#005c2d;color:#ffffff;text-decoration:none;font-weight:700">View your order</a></p>`,
          `Order ${order.order_number} is confirmed and paid.`,
        ),
      }).then(async () => {
        const { error: updateError } = await admin
          .from("orders")
          .update({ customer_confirmation_email_sent_at: new Date().toISOString() })
          .eq("id", order.id)
          .is("customer_confirmation_email_sent_at", null);
        if (updateError) throw new Error(updateError.message);
      }),
    );
  }

  if (!order.admin_notification_email_sent_at) {
    deliveries.push(
      sendEmail({
        to: adminEmail(),
        replyTo: order.email,
        subject: `Paid order ${order.order_number} — ${formatPaise(order.total_paise)}`,
        idempotencyKey: `paid-order-admin/${order.id}`,
        html: shell(
          `<h1 style="margin:0 0 10px;font-size:28px;color:#005c2d">New paid order</h1>
           <p style="margin:0 0 20px;color:#66756d">Order <strong>${escapeHtml(order.order_number)}</strong> is paid and ready for fulfilment.</p>
           ${details}
           <div style="margin-top:22px;padding:16px 18px;border-radius:12px;background:#f4f7f2;line-height:1.6">
             <strong>Customer</strong><br>
             ${escapeHtml(order.full_name)} · ${escapeHtml(order.email)} · +91 ${escapeHtml(order.phone)}
             <br><br><strong>Shipping address</strong><br>${addressHtml(order.shipping_address)}
           </div>
           <div style="margin-top:18px;line-height:1.6">
             ${paymentRef}
             <p style="margin:6px 0"><strong>Payment method:</strong> ${escapeHtml(order.payment_method || "Razorpay")}</p>
           </div>
           <p style="margin:24px 0 0"><a href="${escapeHtml(orderUrl)}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#005c2d;color:#ffffff;text-decoration:none;font-weight:700">Open order</a></p>`,
          `Paid order ${order.order_number} from ${order.full_name}`,
        ),
      }).then(async () => {
        const { error: updateError } = await admin
          .from("orders")
          .update({ admin_notification_email_sent_at: new Date().toISOString() })
          .eq("id", order.id)
          .is("admin_notification_email_sent_at", null);
        if (updateError) throw new Error(updateError.message);
      }),
    );
  }

  await Promise.all(deliveries);
}
