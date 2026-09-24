import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";

import { getSessionUser } from "@/lib/auth";
import { getMyOrders } from "@/lib/queries";
import { PageHero } from "@/components/page-hero";

import { formatPaise } from "@/lib/money";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your orders",
  robots: { index: false, follow: false },
};

const statusTone: Record<string, string> = {
  paid: "bg-accent/25 text-brand",
  processing: "bg-accent/25 text-brand",
  shipped: "bg-accent/25 text-brand",
  delivered: "bg-surface-2 text-brand",
  pending: "bg-surface-2 text-body",
  created: "bg-surface-2 text-body",
  failed: "bg-alert/10 text-alert",
  cancelled: "bg-alert/10 text-alert",
  refunded: "bg-surface-2 text-body",
};

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");

  const orders = await getMyOrders();

  return (
    <>
    <PageHero eyebrow="Account" title="Your orders" lede={user.email} compact>
      <form action="/auth/signout" method="post">
        <button type="submit" className="btn btn-ghost-light">
          Sign out
        </button>
      </form>
    </PageHero>
    <section className="shell py-4 md:py-8">

      {orders.length === 0 ? (
        <div className="card mt-12 px-8 py-20 text-center">
          <Package className="mx-auto h-9 w-9 text-faint" strokeWidth={1.4} />
          <h2 className="display-md mt-5">No orders yet</h2>
          <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-muted">
            Orders you place while signed in show up here. If you checked out as
            a guest with this email, use the order link we gave you at checkout.
          </p>
          <Link href="/products" className="btn btn-primary mt-8">
            Browse the range
          </Link>
        </div>
      ) : (
        <ul className="mt-12 space-y-6">
          {orders.map((order) => (
            <li key={order.id} className="card p-6 md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/order/${order.id}`}
                    className="font-semibold text-xl tabular-nums transition-colors hover:text-brand"
                  >
                    {order.order_number}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      statusTone[order.status] ?? "bg-surface-2 text-body"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="font-semibold text-xl tabular-nums">
                    {formatPaise(order.total_paise)}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 rounded-full border border-line bg-surface py-1 pr-3.5 pl-1"
                  >
                    <span className="relative h-8 w-8 overflow-hidden rounded-full bg-surface-2">
                      {item.product_image && (
                        <Image
                          src={item.product_image}
                          alt=""
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      )}
                    </span>
                    <span className="text-xs">
                      {item.product_name}
                      <span className="text-faint"> ×{item.quantity}</span>
                    </span>
                  </div>
                ))}

                <Link
                  href={`/order/${order.id}`}
                  className="ml-auto text-sm text-brand underline underline-offset-4 hover:text-brand"
                >
                  View details
                </Link>
              </div>

              {order.tracking_number && (
                <p className="mt-4 text-sm text-body">
                  {order.courier_name ?? "Courier"} ·{" "}
                  <span className="tabular-nums">{order.tracking_number}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
    </>
  );
}
