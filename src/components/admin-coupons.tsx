"use client";

import { CalendarDays, Check, Loader2, Plus, TicketPercent } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "@/components/admin-commercial.module.css";
import type { AdminCoupon } from "@/lib/admin-types";
import { formatPaise } from "@/lib/money";

export function AdminCoupons({ initialCoupons, asOf }: { initialCoupons: AdminCoupon[]; asOf: string }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("10");
  const [expiresOn, setExpiresOn] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const redemptions = coupons.reduce((sum, coupon) => sum + coupon.redemptions, 0);
  const savings = coupons.reduce((sum, coupon) => sum + coupon.discount_paise, 0);

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase(), percent: Number(percent), expiresOn: expiresOn || null }),
      });
      const result = await response.json() as { error?: string; coupon?: Omit<AdminCoupon, "redemptions" | "customers" | "discount_paise" | "revenue_paise"> };
      if (response.status === 401) { router.replace("/admin/login"); return; }
      if (!response.ok || !result.coupon) throw new Error(result.error || "Could not create coupon.");
      setCoupons((current) => [{ ...result.coupon!, redemptions: 0, customers: 0, discount_paise: 0, revenue_paise: 0 }, ...current]);
      setCode(""); setExpiresOn(""); setNotice(`${result.coupon.code} is live at checkout.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not create coupon."); }
    finally { setBusy(false); }
  }

  async function toggle(coupon: AdminCoupon) {
    setBusy(true); setNotice("");
    try {
      const response = await fetch(`/api/admin/coupons/${encodeURIComponent(coupon.code)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !coupon.active }),
      });
      const result = await response.json() as { error?: string; coupon?: { active: boolean } };
      if (response.status === 401) { router.replace("/admin/login"); return; }
      if (!response.ok || !result.coupon) throw new Error(result.error || "Could not update coupon.");
      setCoupons((current) => current.map((item) => item.code === coupon.code ? { ...item, active: result.coupon!.active } : item));
      setNotice(`${coupon.code} ${result.coupon.active ? "activated" : "paused"}.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not update coupon."); }
    finally { setBusy(false); }
  }

  return <section className={styles.section}>
    <div className={styles.heading}><div><span className={styles.kicker}>PROMOTION STUDIO</span><h1>Coupons with a clear return.</h1><p>Create a code, choose the discount, then follow every paid redemption.</p></div><span className={styles.headingIcon}><TicketPercent size={29} /></span></div>
    <div className={styles.metrics}><div><span>Codes created</span><strong>{coupons.length}</strong></div><div><span>Paid redemptions</span><strong>{redemptions}</strong></div><div><span>Customer savings</span><strong>{formatPaise(savings)}</strong></div></div>
    <div className={styles.twoColumn}>
      <form className={styles.card} onSubmit={create}><span className={styles.kicker}>NEW OFFER</span><h2>Make a coupon</h2><p className={styles.help}>Discounts apply to product M.R.P. at checkout. Codes cannot be stacked.</p><label className={styles.field}>Code<input required minLength={4} maxLength={32} pattern="[A-Za-z0-9_-]+" placeholder="e.g. WELLNESS15" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} /></label><div className={styles.fieldPair}><label className={styles.field}>Discount %<input required type="number" min="1" max="80" value={percent} onChange={(event) => setPercent(event.target.value)} /></label><label className={styles.field}>Expires on <span>(optional)</span><input type="date" value={expiresOn} onChange={(event) => setExpiresOn(event.target.value)} /></label></div><button className={styles.primary} disabled={busy} type="submit">{busy ? <Loader2 size={17} className={styles.spin} /> : <Plus size={17} />}Create coupon</button>{notice ? <p className={styles.feedback} role="status">{notice}</p> : null}</form>
      <div className={styles.card}><span className={styles.kicker}>HOW IT WORKS</span><h2>One code. One story.</h2><div className={styles.steps}><p><Check size={17} />Code is validated live before it changes cart totals.</p><p><Check size={17} />Checkout recalculates the discount securely on the server.</p><p><Check size={17} />Paid orders count as redemptions; abandoned attempts do not.</p><p><CalendarDays size={17} />An expiry is optional. Pause a code anytime.</p></div></div>
    </div>
    <div className={styles.card}><div className={styles.cardHeader}><div><span className={styles.kicker}>PERFORMANCE</span><h2>Coupon ledger</h2></div><span>{coupons.length} codes</span></div><div className={styles.scroll}><table className={styles.table}><thead><tr><th>Code</th><th>Offer</th><th>People</th><th>Paid uses</th><th>Discount given</th><th>Order revenue</th><th>State</th><th>Control</th></tr></thead><tbody>{coupons.map((coupon) => { const expired = Boolean(coupon.expires_at && Date.parse(coupon.expires_at) <= Date.parse(asOf)); return <tr key={coupon.code}><td><strong className={styles.code}>{coupon.code}</strong></td><td>{coupon.discount_percent}% off</td><td><strong>{coupon.customers}</strong></td><td><strong>{coupon.redemptions}</strong></td><td>{formatPaise(coupon.discount_paise)}</td><td>{formatPaise(coupon.revenue_paise)}</td><td><span className={`${styles.pill} ${coupon.active && !expired ? styles.pillLive : styles.pillOff}`}>{expired ? "Expired" : coupon.active ? "Live" : "Paused"}</span></td><td><button className={styles.textButton} disabled={busy || expired} onClick={() => toggle(coupon)}>{coupon.active ? "Pause" : "Activate"}</button></td></tr>; })}</tbody></table></div>{!coupons.length ? <p className={styles.help}>No coupons yet. Create your first code above.</p> : null}</div>
  </section>;
}
