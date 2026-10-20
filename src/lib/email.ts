import { formatPaise } from "@/lib/money";
import { COUPON } from "@/lib/offer";
import { site } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderItem, OrderStatus, ShippingAddress } from "@/lib/types";
import { siteUrl } from "@/lib/utils";

type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  idempotencyKey: string;
  replyTo?: string;
  headers?: Record<string, string>;
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
      headers: message.headers,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend returned ${response.status}: ${await response.text()}`);
  }
}

function shell(content: string, preheader: string, unsubscribeUrl?: string): string {
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
          .email-body { padding: 28px 20px !important; }
          .email-footer { padding: 18px 20px !important; }
          .email-brand { font-size: 17px !important; }
          .email-mark { width: 44px !important; height: 44px !important; }
          h1 { font-size: 25px !important; }
        }
      </style>
    </head>
    <body style="margin:0;background:#f5f7ef;font-family:Arial,Helvetica,sans-serif;color:#173b29">
      <span style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</span>
      <table class="email-outer" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7ef;padding:36px 12px">
        <tr><td align="center">
          <table class="email-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fffefa;border:1px solid #dce8d7;border-top:5px solid #bfdf67;border-radius:22px;overflow:hidden;box-shadow:0 18px 55px rgba(15,54,36,.09)">
            <tr><td class="email-header" style="background-color:#eaf4e2;background-image:linear-gradient(120deg,#edf7e4 0%,#f8fbe9 70%,#e6f3df 100%);padding:26px 32px;color:#064b2d">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="58" valign="middle">
                    <div class="email-mark" style="width:50px;height:50px;border:1px solid #c7dfc4;border-radius:14px;background:#ffffff;text-align:center;overflow:hidden">
                      <img src="${escapeHtml(markUrl)}" width="50" height="50" alt="" style="display:block;width:50px;height:50px;object-fit:contain">
                    </div>
                  </td>
                  <td valign="middle" style="padding-left:13px">
                    <div class="email-brand" style="font-size:19px;line-height:1.1;font-weight:800;letter-spacing:-.02em">Leaf Genix Lifesciences</div>
                    <div style="margin-top:5px;font-size:11px;line-height:1.3;color:#64836a">Lifting and Empowering All Families</div>
                  </td>
                </tr>
              </table>
            </td></tr>
            <tr><td class="email-body" style="padding:36px 34px"><div style="margin-bottom:18px;font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#73934e">CARE, DELIVERED WITH CLARITY</div>${content}</td></tr>
            <tr><td class="email-footer" style="padding:22px 32px;background:#f1f7ed;border-top:1px solid #deead7;font-size:12px;line-height:1.7;color:#64756c">
              <strong style="color:#315544">Need a hand?</strong> Reply to this email or contact<br>
              <a href="mailto:${escapeHtml(site.email)}" style="color:#005c2d;text-decoration:none">${escapeHtml(site.email)}</a>
              &nbsp;·&nbsp;
              <a href="tel:${escapeHtml(site.supportPhone.replace(/\s/g, ""))}" style="color:#005c2d;text-decoration:none">${escapeHtml(site.supportPhone)}</a>
            </td></tr>
          </table>
          <div style="max-width:600px;padding:18px 18px 0;font-size:11px;line-height:1.6;color:#829087;text-align:center">
            ${escapeHtml(site.fullName)} · Jaipur, Rajasthan<br>
            ${unsubscribeUrl ? `You received this because you opted in to Leaf Genix offers.<br><a href="${escapeHtml(unsubscribeUrl)}" style="color:#315544;text-decoration:underline">Unsubscribe from marketing emails</a>` : "This email relates to your enquiry, coupon request, or order."}
          </div>
        </td></tr>
      </table>
    </body>
  </html>`;
}

export async function sendMarketingEmail(input: {
  campaignId: string;
  to: string;
  name: string;
  subject: string;
  body: string;
  unsubscribeToken: string;
}): Promise<void> {
  const unsubscribeUrl = siteUrl(`/api/marketing/unsubscribe?token=${encodeURIComponent(input.unsubscribeToken)}`);
  const paragraphs = input.body.trim().split(/\n\s*\n/).map((paragraph) =>
    `<p style="margin:0 0 17px;color:#40584a;font-size:15px;line-height:1.8">${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`,
  ).join("");
  const html = shell(
    `<p style="margin:0 0 8px;color:#66756d">Hi ${escapeHtml(input.name)},</p>
     <h1 style="margin:0 0 22px;font-size:29px;line-height:1.18;color:#005c2d">${escapeHtml(input.subject)}</h1>
     ${paragraphs}
     <p style="margin:24px 0 0"><a href="${escapeHtml(siteUrl("/products"))}" style="display:inline-block;padding:13px 22px;border-radius:999px;background:#005c2d;color:#ffffff;text-decoration:none;font-weight:700">Explore Leaf Genix</a></p>`,
    input.subject,
    unsubscribeUrl,
  );
  await sendEmail({
    to: input.to,
    replyTo: site.email,
    subject: `${input.subject} · ${site.name}`,
    html,
    idempotencyKey: `marketing/${input.campaignId}/${input.to}`,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
    },
  });
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

export async function sendOrderStatusEmail(
  orderId: string,
  status: Extract<OrderStatus, "processing" | "shipped" | "delivered" | "cancelled">,
): Promise<void> {
  if (!emailConfigured()) throw new Error("Order email delivery is not configured");

  const { data, error } = await createAdminClient()
    .from("orders")
    .select(
      "id, order_number, email, full_name, status, courier_name, tracking_number, updated_at",
    )
    .eq("id", orderId)
    .single();
  if (error || !data) {
    throw new Error(`Could not load order status email: ${error?.message ?? orderId}`);
  }

  const copy = {
    processing: {
      subject: `Order ${data.order_number} is being prepared`,
      heading: "Your order is being prepared.",
      body: "Our fulfilment team is packing your Leaf Genix order. We will send the tracking details as soon as it leaves our facility.",
    },
    shipped: {
      subject: `Order ${data.order_number} has shipped`,
      heading: "Your order is on its way.",
      body: `Your parcel has been handed to ${data.courier_name || "our delivery partner"}.`,
    },
    delivered: {
      subject: `Order ${data.order_number} was delivered`,
      heading: "Delivered to your doorstep.",
      body: "Your delivery has been marked complete. We hope the Leaf Genix experience feels as considered as the products inside.",
    },
    cancelled: {
      subject: `Order ${data.order_number} was cancelled`,
      heading: "Your order has been cancelled.",
      body: "This order will not be dispatched. If a payment was captured, our support team will contact you about the refund process.",
    },
  }[status];

  const tracking =
    data.tracking_number && (status === "shipped" || status === "delivered")
      ? `<div style="margin-top:20px;padding:17px 18px;border-radius:13px;background:#f4f7f2;border-left:4px solid #c9e82d;line-height:1.7">
          <strong>Delivery partner:</strong> ${escapeHtml(data.courier_name || "—")}<br>
          <strong>Tracking number:</strong> ${escapeHtml(data.tracking_number)}
        </div>`
      : "";

  const stages = ["Order placed", "Preparing", "Shipped", "Delivered"];
  const currentStage = { processing: 1, shipped: 2, delivered: 3, cancelled: -1 }[status];
  const progress = status === "cancelled" ? "" : `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0;border-collapse:separate;border-spacing:4px"><tr>${stages.map((stage, index) => `<td style="padding:10px 4px;border-radius:7px;background:${index <= currentStage ? "#dcefb6" : "#edf0ea"};color:${index <= currentStage ? "#175438" : "#84948a"};font-size:10px;font-weight:700;text-align:center">${stage}</td>`).join("")}</tr></table>`;

  await sendEmail({
    to: data.email,
    replyTo: site.email,
    subject: `${copy.subject} · ${site.name}`,
    idempotencyKey: `order-status-${status}/${data.id}/${data.updated_at}`,
    html: shell(
      `<p style="margin:0 0 8px;color:#66756d">Hi ${escapeHtml(data.full_name)},</p>
       <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;color:#005c2d">${escapeHtml(copy.heading)}</h1>
       <p style="margin:0;line-height:1.75">${escapeHtml(copy.body)}</p>
       ${progress}
       ${tracking}
       <p style="margin:24px 0 0"><a href="${escapeHtml(siteUrl(`/order/${data.id}`))}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#005c2d;color:#ffffff;text-decoration:none;font-weight:700">View order details</a></p>`,
      `${copy.heading} Order ${data.order_number}.`,
    ),
  });
}
