import { z } from "zod";

import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function page(content: string): Response {
  return new Response(`<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email preferences · Leaf Genix</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f3f8ed;color:#123e29;font-family:Arial,sans-serif}.card{width:min(90%,440px);padding:36px;background:#fffefa;border:1px solid #dce9d4;border-radius:22px;box-shadow:0 18px 60px #0b422018}h1{margin:0 0 14px;font-size:30px}p{line-height:1.6;color:#516b58}button{border:0;border-radius:12px;background:#075b38;color:white;padding:13px 19px;font-size:15px;font-weight:700;cursor:pointer}a{color:#075b38}</style></head><body><main class="card"><p style="font-weight:800;color:#075b38">LEAF GENIX LIFESCIENCES</p>${content}</main></body></html>`, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!z.string().uuid().safeParse(token).success) return page("<h1>Link not found</h1><p>This email preference link is invalid.</p>");
  return page(`<h1>Email preferences</h1><p>Stop receiving Leaf Genix marketing emails? Your order and customer-care emails will still arrive.</p><form method="post"><input type="hidden" name="token" value="${token}"><button type="submit">Unsubscribe me</button></form>`);
}

export async function POST(request: Request) {
  if (!adminConfigured()) return page("<h1>Please try later</h1><p>Email preferences are temporarily unavailable.</p>");
  const form = await request.formData();
  const token = form.get("token");
  if (typeof token !== "string" || !z.string().uuid().safeParse(token).success) return page("<h1>Link not found</h1><p>This email preference link is invalid.</p>");
  const { error } = await createAdminClient().from("marketing_subscribers")
    .update({ unsubscribed_at: new Date().toISOString() }).eq("unsubscribe_token", token);
  if (error) {
    console.error("[marketing/unsubscribe]", error.message);
    return page("<h1>Please try again</h1><p>We could not update your preferences. Please try again shortly.</p>");
  }
  return page("<h1>You’re unsubscribed.</h1><p>We will no longer send you promotional email. Thank you for being part of Leaf Genix.</p><a href=\"/\">Return to Leaf Genix</a>");
}
