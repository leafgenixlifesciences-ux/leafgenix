"use client";

import {
  AlertTriangle, BellRing, Boxes, Check, CheckCheck, ChevronRight,
  CircleDot, Download, ExternalLink, Inbox, IndianRupee, LayoutDashboard, Leaf, Loader2,
  LogOut, Mail, MapPin, Menu, PackageCheck, PackageOpen, Phone, RefreshCw,
  Search, Send, ShoppingBag, Truck, UsersRound, X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import styles from "@/components/admin-dashboard.module.css";
import { AdminPushControl } from "@/components/admin-push-control";
import type { AdminLead, AdminOrder, AdminProductHealth } from "@/lib/admin-types";
import { formatPaise } from "@/lib/money";
import type { OrderStatus } from "@/lib/types";

type View = "overview" | "orders" | "leads";
type Notice = { tone: "success" | "error"; text: string } | null;
const fulfilmentStatuses = ["processing", "shipped", "delivered", "cancelled"] as const;
const paidStatuses: OrderStatus[] = ["paid", "processing", "shipped", "delivered"];

const statusLabel: Record<OrderStatus, string> = {
  created: "Created", pending: "Awaiting payment", paid: "Order placed",
  failed: "Payment failed", processing: "Preparing", shipped: "Shipped",
  delivered: "Delivered", cancelled: "Cancelled", refunded: "Refunded",
};
const statusClass: Record<OrderStatus, string> = {
  created: styles.statusNeutral, pending: styles.statusPending, paid: styles.statusPaid,
  failed: styles.statusFailed, processing: styles.statusProcessing,
  shipped: styles.statusShipped, delivered: styles.statusDelivered,
  cancelled: styles.statusCancelled, refunded: styles.statusRefunded,
};
const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit", month: "short", year: "numeric", hour: "2-digit",
  minute: "2-digit", timeZone: "Asia/Kolkata",
});
const dayFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata",
});

function dateTime(value: string) { return dateFormatter.format(new Date(value)); }
function csvCell(value: unknown) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
function downloadCsv(name: string, rows: unknown[][]) {
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url);
}

function StatusPill({ status }: { status: OrderStatus }) {
  return <span className={`${styles.status} ${statusClass[status]}`}>
    <span className={styles.statusDot} />{statusLabel[status]}
  </span>;
}

function PageHeading({ title, body, aside }: { title: string; body: string; aside?: React.ReactNode }) {
  return <div className={styles.pageHeading}><div><h2>{title}</h2><p>{body}</p></div>{aside ? <aside>{aside}</aside> : null}</div>;
}

export function AdminDashboard({ initialOrders, initialLeads, products, dataError, syncedAt }: {
  initialOrders: AdminOrder[]; initialLeads: AdminLead[]; products: AdminProductHealth[];
  dataError: string | null; syncedAt: string;
}) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [view, setView] = useState<View>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [orders, setOrders] = useState(initialOrders);
  const [leads, setLeads] = useState(initialLeads);
  const [orderQuery, setOrderQuery] = useState("");
  const [leadQuery, setLeadQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<(typeof fulfilmentStatuses)[number]>("processing");
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;
  const revenue = orders.filter((order) => paidStatuses.includes(order.status)).reduce((sum, order) => sum + order.total_paise, 0);
  const fulfilmentQueue = orders.filter((order) => ["paid", "processing", "shipped"].includes(order.status));
  const openLeads = leads.filter((lead) => !lead.handled);
  const lowStock = products.filter((product) => product.stock <= 10);

  const filteredOrders = useMemo(() => {
    const query = orderQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesQuery = !query || [order.order_number, order.full_name, order.email, order.phone, order.tracking_number || ""].some((value) => value.toLowerCase().includes(query));
      return matchesStatus && matchesQuery;
    });
  }, [orderQuery, orders, statusFilter]);
  const filteredLeads = useMemo(() => {
    const query = leadQuery.trim().toLowerCase();
    return leads.filter((lead) => !query || [lead.name, lead.email, lead.phone || "", lead.subject || "", lead.message].some((value) => value.toLowerCase().includes(query)));
  }, [leadQuery, leads]);

  function changeView(next: View) { setView(next); setMobileNav(false); setNotice(null); }
  function refreshData() { startRefresh(() => router.refresh()); }
  function openOrder(order: AdminOrder) {
    setSelectedOrderId(order.id);
    setEditStatus(fulfilmentStatuses.includes(order.status as (typeof fulfilmentStatuses)[number]) ? order.status as (typeof fulfilmentStatuses)[number] : "processing");
    setCourierName(order.courier_name || ""); setTrackingNumber(order.tracking_number || ""); setNotice(null);
  }

  async function saveFulfilment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selectedOrder) return; setSaving(true); setNotice(null);
    const stageChanged = selectedOrder.status !== editStatus;
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus, courierName, trackingNumber }),
      });
      const result = await response.json() as { error?: string; warning?: string; order?: Pick<AdminOrder, "id" | "status" | "courier_name" | "tracking_number" | "updated_at"> };
      if (response.status === 401) { router.replace("/admin/login"); return; }
      if (!response.ok || !result.order) throw new Error(result.error || "Update failed.");
      setOrders((current) => current.map((order) => order.id === result.order?.id ? { ...order, ...result.order } : order));
      setNotice({ tone: result.warning ? "error" : "success", text: result.warning || (stageChanged ? "Order stage updated. Customer email sent." : "Courier details saved. No new stage email was needed.") });
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Update failed." });
    } finally { setSaving(false); }
  }

  async function toggleLead(lead: AdminLead) {
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ handled: !lead.handled }) });
      const result = await response.json() as { error?: string; lead?: { id: string; handled: boolean } };
      if (response.status === 401) { router.replace("/admin/login"); return; }
      if (!response.ok || !result.lead) throw new Error(result.error || "Lead update failed.");
      setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, handled: result.lead!.handled } : item));
    } catch (error) { setNotice({ tone: "error", text: error instanceof Error ? error.message : "Lead update failed." }); }
  }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); router.refresh(); }

  const nav = [
    { id: "overview" as const, label: "Overview", icon: LayoutDashboard, count: 0 },
    { id: "orders" as const, label: "Orders", icon: ShoppingBag, count: fulfilmentQueue.length },
    { id: "leads" as const, label: "Leads", icon: UsersRound, count: openLeads.length },
  ];

  return <div className={styles.root}>
    <aside className={`${styles.rail} ${mobileNav ? styles.railOpen : ""}`}>
      <div className={styles.brand}><Image src="/leafgenix-lockup.png" alt="Leaf Genix Lifesciences" width={1025} height={260} priority /><button className={styles.closeNav} onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <div className={styles.workspaceIdentity}><span className={styles.workspaceMark}><Leaf size={18} /></span><div><strong>Operations</strong><span>Private workspace</span></div></div>
      <nav className={styles.nav} aria-label="Admin portal">{nav.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => changeView(item.id)} className={`${styles.navButton} ${view === item.id ? styles.navActive : ""}`}><Icon size={18} /><span className={styles.navLabel}>{item.label}</span>{item.count > 0 ? <span className={styles.navCount}>{item.count}</span> : null}</button>; })}</nav>
      <div className={styles.railBottom}><div className={styles.connection}><span className={`${styles.connectionDot} ${dataError ? styles.connectionIssue : ""}`} />{dataError ? "Credentials required" : "Live database"}</div><button className={styles.signOut} onClick={logout}><LogOut size={17} /><span>Sign out</span></button></div>
    </aside>
    {mobileNav ? <button className={styles.navBackdrop} aria-label="Close navigation" onClick={() => setMobileNav(false)} /> : null}

    <div className={styles.workspace}>
      <header className={styles.topbar}>
        <button className={styles.menuButton} onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={18} /></button>
        <div className={styles.topbarTitle}><strong>LeafGenix control room</strong><span>Orders, customer care and delivery</span></div>
        <span className={styles.syncMeta}><CircleDot size={14} />Synced {dateTime(syncedAt)} IST</span>
        <button className={`${styles.refreshButton} ${isRefreshing ? styles.refreshing : ""}`} onClick={refreshData} disabled={isRefreshing}><RefreshCw size={15} /><span>{isRefreshing ? "Syncing" : "Refresh"}</span></button>
        <button className={styles.iconButton} onClick={() => changeView("leads")} aria-label={`${openLeads.length} open leads`}><BellRing size={17} />{openLeads.length ? <span className={styles.notificationCount}>{openLeads.length}</span> : null}</button>
      </header>

      <main className={styles.content}>
        {dataError ? <div className={styles.errorBanner} role="alert"><AlertTriangle size={18} /><span>{dataError}</span></div> : null}
        {notice && !selectedOrder ? <div className={`${styles.notice} ${notice.tone === "success" ? styles.noticeSuccess : styles.noticeError}`}>{notice.text}</div> : null}
        {view === "overview" ? <Overview orders={orders} leads={leads} revenue={revenue} fulfilmentQueue={fulfilmentQueue} openLeads={openLeads} lowStock={lowStock} syncedAt={syncedAt} onView={changeView} onOpenOrder={openOrder} /> : view === "orders" ? <OrdersView orders={filteredOrders} query={orderQuery} setQuery={setOrderQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onOpen={openOrder} /> : <LeadsView leads={filteredLeads} query={leadQuery} setQuery={setLeadQuery} onToggle={toggleLead} />}
      </main>
    </div>

    {selectedOrder ? <OrderDrawer order={selectedOrder} status={editStatus} setStatus={setEditStatus} courierName={courierName} setCourierName={setCourierName} trackingNumber={trackingNumber} setTrackingNumber={setTrackingNumber} saving={saving} notice={notice} onClose={() => { setSelectedOrderId(null); setNotice(null); }} onSave={saveFulfilment} /> : null}
  </div>;
}

function Overview({ orders, leads, revenue, fulfilmentQueue, openLeads, lowStock, syncedAt, onView, onOpenOrder }: {
  orders: AdminOrder[]; leads: AdminLead[]; revenue: number; fulfilmentQueue: AdminOrder[];
  openLeads: AdminLead[]; lowStock: AdminProductHealth[]; syncedAt: string;
  onView: (view: View) => void; onOpenOrder: (order: AdminOrder) => void;
}) {
  const stages = [
    { label: "Order placed", count: orders.filter((o) => o.status === "paid").length, icon: ShoppingBag },
    { label: "Preparing", count: orders.filter((o) => o.status === "processing").length, icon: PackageOpen },
    { label: "Shipped", count: orders.filter((o) => o.status === "shipped").length, icon: Truck },
    { label: "Delivered", count: orders.filter((o) => o.status === "delivered").length, icon: CheckCheck },
  ];
  const metrics = [
    { label: "Orders", value: orders.length, detail: `${fulfilmentQueue.length} active ${fulfilmentQueue.length === 1 ? "fulfilment" : "fulfilments"}`, icon: ShoppingBag, action: () => onView("orders") },
    { label: "Paid revenue", value: formatPaise(revenue), detail: "Captured order value", icon: IndianRupee },
    { label: "Open leads", value: openLeads.length, detail: `${leads.length} total enquiries`, icon: UsersRound, action: () => onView("leads") },
    { label: "Low stock", value: lowStock.length, detail: lowStock.length ? "10 units or fewer" : "Stock healthy", icon: AlertTriangle },
  ];
  return <section>
    <div className={styles.pageHeading}><div><h1>Today’s operations</h1><p>{dayFormatter.format(new Date(syncedAt))} · live commercial snapshot</p></div><aside>Move paid orders forward, answer open leads and keep dispatch details accurate from one workspace.</aside></div>
    <section className={styles.commandBand}><div className={styles.commandHead}><div><strong>Fulfilment flow</strong><span>Payment confirmation to final delivery</span></div><Truck size={22} strokeWidth={1.9} /></div><div className={styles.stages}>{stages.map((stage) => { const Icon = stage.icon; return <div className={styles.stage} key={stage.label}><span className={styles.stageIcon}><Icon size={21} strokeWidth={1.9} /></span><div><strong>{String(stage.count).padStart(2, "0")}</strong><span className={styles.stageLabel}>{stage.label}</span></div></div>; })}</div></section>
    <div className={styles.metricRail}>{metrics.map((metric) => { const Icon = metric.icon; return <button className={styles.metric} key={metric.label} onClick={metric.action} disabled={!metric.action}><div className={styles.metricTop}><span>{metric.label}</span><span className={styles.metricIcon}><Icon size={19} strokeWidth={1.9} /></span></div><div className={styles.metricValue}>{metric.value}</div><div className={styles.metricDetail}>{metric.detail}</div></button>; })}</div>
    <AdminPushControl />
    <div className={styles.overviewGrid}>
      <section className={styles.panel}><div className={styles.panelHeader}><div><h2>Recent orders</h2><p>The newest payments and fulfilment stages.</p></div><button className={styles.textButton} onClick={() => onView("orders")}>View all</button></div><OrderList orders={orders.slice(0, 6)} onOpen={onOpenOrder} embedded /></section>
      <section className={styles.panel}><div className={styles.panelHeader}><div><h2>Attention</h2><p>The next actions with customer impact.</p></div><CircleDot size={17} color="#ff7a59" /></div><div className={styles.pulseList}>{[
        { label: "Paid, not packed", value: orders.filter((o) => o.status === "paid").length, action: () => onView("orders") },
        { label: "Open customer leads", value: openLeads.length, action: () => onView("leads") },
        { label: "Products low on stock", value: lowStock.length, action: undefined },
      ].map((item) => <button className={styles.pulseItem} data-urgent={item.value > 0} key={item.label} onClick={item.action} disabled={!item.action}><span className={styles.pulseValue}>{item.value}</span><strong>{item.label}</strong>{item.action ? <ChevronRight size={15} /> : null}</button>)}</div></section>
    </div>
  </section>;
}

function OrdersView({ orders, query, setQuery, statusFilter, setStatusFilter, onOpen }: {
  orders: AdminOrder[]; query: string; setQuery: (value: string) => void;
  statusFilter: string; setStatusFilter: (value: string) => void; onOpen: (order: AdminOrder) => void;
}) {
  function exportOrders() { downloadCsv("leafgenix-orders.csv", [["Order", "Customer", "Email", "Phone", "Status", "Total", "Courier", "Tracking", "Created"], ...orders.map((o) => [o.order_number, o.full_name, o.email, o.phone, statusLabel[o.status], o.total_paise / 100, o.courier_name, o.tracking_number, o.created_at])]); }
  return <section><PageHeading title="Order desk" body="Search payment records, prepare parcels and update delivery progress." aside={`${orders.length} matching order${orders.length === 1 ? "" : "s"}`} /><div className={styles.toolbar}><label className={styles.searchField}><Search size={16} /><span className="sr-only">Search orders</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Order, customer, phone or tracking…" /></label><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter order status"><option value="all">All statuses</option>{Object.entries(statusLabel).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><button className={styles.secondaryButton} onClick={exportOrders}><Download size={15} />Export</button></div><OrderList orders={orders} onOpen={onOpen} /></section>;
}

function LeadsView({ leads, query, setQuery, onToggle }: { leads: AdminLead[]; query: string; setQuery: (value: string) => void; onToggle: (lead: AdminLead) => void }) {
  function exportLeads() { downloadCsv("leafgenix-leads.csv", [["Name", "Email", "Phone", "Subject", "Message", "Handled", "Created"], ...leads.map((l) => [l.name, l.email, l.phone, l.subject, l.message, l.handled ? "Yes" : "No", l.created_at])]); }
  return <section><PageHeading title="Lead inbox" body="Coupon requests and contact enquiries, ready to action." aside={`${leads.filter((l) => !l.handled).length} open conversations`} /><div className={styles.toolbar}><label className={styles.searchField}><Search size={16} /><span className="sr-only">Search leads</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, phone or message…" /></label><button className={styles.secondaryButton} onClick={exportLeads}><Download size={15} />Export</button></div><LeadList leads={leads} onToggle={onToggle} /></section>;
}

function OrderList({ orders, onOpen, embedded = false }: { orders: AdminOrder[]; onOpen: (order: AdminOrder) => void; embedded?: boolean }) {
  if (!orders.length) return <div className={styles.empty}><div><Inbox size={30} /><strong>No orders in this view</strong><span>{embedded ? "New customer orders will appear here after the database syncs." : "Try a different search or status filter."}</span></div></div>;
  return <div className={embedded ? "" : styles.tableWrap}><div className={styles.tableScroller}><table className={styles.table}><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Delivery</th><th style={{ textAlign: "right" }}>Value</th><th aria-label="Open" /></tr></thead><tbody>{orders.map((order) => <tr key={order.id} onClick={() => onOpen(order)}><td><div className={styles.orderId}>{order.order_number}</div><div className={styles.subtle}>{dateTime(order.created_at)}</div></td><td><div className={styles.customer}>{order.full_name}</div><div className={styles.subtle}>{order.email}</div></td><td><StatusPill status={order.status} /></td><td><div className={styles.customer}>{order.courier_name || "Not assigned"}</div><div className={styles.subtle}>{order.tracking_number || "Tracking pending"}</div></td><td className={styles.money}>{formatPaise(order.total_paise)}</td><td><ChevronRight size={15} color="#8c9a91" /></td></tr>)}</tbody></table></div><div className={styles.mobileOrders}>{orders.map((order) => <button key={order.id} className={styles.mobileOrder} onClick={() => onOpen(order)}><div className={styles.mobileOrderTop}><div><div className={styles.orderId}>{order.order_number}</div><div className={styles.customer}>{order.full_name}</div></div><StatusPill status={order.status} /></div><div className={styles.mobileOrderBottom}><div className={styles.subtle}>{dateTime(order.created_at)}</div><div className={styles.money}>{formatPaise(order.total_paise)}</div></div></button>)}</div></div>;
}

function LeadList({ leads, onToggle }: { leads: AdminLead[]; onToggle: (lead: AdminLead) => void }) {
  if (!leads.length) return <div className={`${styles.panel} ${styles.empty}`}><div><Inbox size={30} /><strong>No leads in this view</strong><span>New coupon requests and enquiries will appear here.</span></div></div>;
  return <div className={styles.leadGrid}>{leads.map((lead) => { const coupon = lead.subject?.toLowerCase().includes("coupon"); return <article key={lead.id} className={`${styles.leadCard} ${lead.handled ? styles.leadHandled : ""}`}><div className={styles.leadHead}><span className={`${styles.leadIcon} ${coupon ? styles.couponIcon : ""}`}>{coupon ? <Leaf size={17} /> : <Mail size={17} />}</span><div className={styles.leadIdentity}><strong>{lead.name}</strong><span>{lead.subject || "Website enquiry"}</span></div><span className={styles.leadDate}>{dateTime(lead.created_at)}</span></div><p className={styles.leadMessage}>{lead.message}</p><div className={styles.leadActions}><a className={styles.leadAction} href={`mailto:${lead.email}`}><Mail size={13} />Email</a>{lead.phone ? <a className={styles.leadAction} href={`tel:${lead.phone}`}><Phone size={13} />{lead.phone}</a> : null}<button className={`${styles.leadAction} ${styles.handledButton}`} onClick={() => onToggle(lead)}>{lead.handled ? <CircleDot size={13} /> : <Check size={13} />}{lead.handled ? "Reopen" : "Mark handled"}</button></div></article>; })}</div>;
}

function OrderDrawer({ order, status, setStatus, courierName, setCourierName, trackingNumber, setTrackingNumber, saving, notice, onClose, onSave }: {
  order: AdminOrder; status: (typeof fulfilmentStatuses)[number]; setStatus: (status: (typeof fulfilmentStatuses)[number]) => void;
  courierName: string; setCourierName: (value: string) => void; trackingNumber: string; setTrackingNumber: (value: string) => void;
  saving: boolean; notice: Notice; onClose: () => void; onSave: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const address = order.shipping_address;
  const canUpdateDelivery = ["paid", "processing", "shipped"].includes(order.status);
  const choices = order.status === "paid" ? ["processing", "shipped", "delivered", "cancelled"] as const
    : order.status === "processing" ? ["processing", "shipped", "delivered", "cancelled"] as const
    : ["shipped", "delivered"] as const;
  return <div className={styles.drawerBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="order-drawer-title">
    <header className={styles.drawerHeader}><div><div className={styles.orderId}>{order.order_number}</div><h2 id="order-drawer-title">Fulfilment details</h2></div><button className={styles.iconButton} onClick={onClose} aria-label="Close order"><X size={18} /></button></header>
    <div className={styles.drawerBody}>
      <section className={styles.customerBlock}><div className={styles.customerBlockTop}><strong>{order.full_name}</strong><StatusPill status={order.status} /></div><div className={styles.customerLinks}><a href={`mailto:${order.email}`}><Mail size={14} />{order.email}</a><a href={`tel:${order.phone}`}><Phone size={14} />+91 {order.phone}</a></div></section>
      <section className={styles.drawerPanel}><h3><MapPin size={15} />Delivery address</h3><address>{address.line1}<br />{address.line2 ? <>{address.line2}<br /></> : null}{address.city}, {address.state} {address.pincode}<br />{address.country}</address>{order.notes ? <p>Customer note: {order.notes}</p> : null}</section>
      <section className={styles.drawerPanel}><h3><Boxes size={15} />Items · {formatPaise(order.total_paise)}</h3><div>{order.order_items.map((item) => <div className={styles.itemRow} key={item.id}><div><strong>{item.product_name}</strong><span className={styles.subtle}>Qty {item.quantity} × {formatPaise(item.unit_price_paise)}</span></div><strong>{formatPaise(item.total_paise)}</strong></div>)}</div></section>
      {!canUpdateDelivery && notice ? <div className={`${styles.notice} ${notice.tone === "success" ? styles.noticeSuccess : styles.noticeError}`}>{notice.text}</div> : null}
      {canUpdateDelivery ? <form className={styles.fulfilmentForm} onSubmit={onSave}><h3><Truck size={17} />Move this order forward</h3><p>Current stage: <strong>{statusLabel[order.status]}</strong>. A new stage sends a branded update to the customer.</p><div className={styles.statusChoices}>{choices.map((value) => <button type="button" key={value} onClick={() => setStatus(value)} className={`${styles.statusChoice} ${status === value ? styles.statusChoiceActive : ""}`}>{statusLabel[value]}</button>)}</div><div className={styles.fieldGrid}><label>Courier<input value={courierName} onChange={(e) => setCourierName(e.target.value)} required={status === "shipped"} placeholder="e.g. Delhivery" /></label><label>Tracking number<input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} required={status === "shipped"} placeholder="AWB / tracking ID" /></label></div>{status === "delivered" && !trackingNumber ? <p className={styles.fieldHint}>Past deliveries can be closed without tracking details. Please verify the delivery before notifying the customer.</p> : null}{status === "cancelled" ? <p className={styles.warning}><AlertTriangle size={15} />This does not refund the payment. Process any Razorpay refund separately.</p> : null}{notice ? <div className={`${styles.notice} ${notice.tone === "success" ? styles.noticeSuccess : styles.noticeError}`} style={{ marginTop: ".75rem", marginBottom: 0 }}>{notice.text}</div> : null}<button className={styles.primaryButton} type="submit" disabled={saving}>{saving ? <Loader2 size={15} /> : <Send size={15} />}{saving ? "Saving update…" : "Save and notify customer"}</button></form> : <div className={styles.warning} style={{ marginTop: 0 }}><PackageCheck size={16} />{order.status === "delivered" ? "This order is delivered and complete." : order.status === "cancelled" ? "This order has been cancelled." : "Delivery controls unlock after Razorpay confirms payment."}</div>}
      <div className={styles.drawerMeta}><span>Payment: {order.payment_method || "Razorpay"}</span>{order.razorpay_payment_id ? <span className={styles.orderId}>{order.razorpay_payment_id}</span> : null}<a href={`/order/${order.id}`} target="_blank">Customer view <ExternalLink size={12} /></a></div>
    </div>
  </aside></div>;
}
