"use client";

import { ArrowRight, Check, Loader2, Mail, RotateCcw, Send } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "@/components/admin-commercial.module.css";
import type { AdminCampaign } from "@/lib/admin-types";

export function AdminMarketing({ subscriberCount, initialCampaign }: { subscriberCount: number; initialCampaign: AdminCampaign | null }) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [campaign, setCampaign] = useState(initialCampaign);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");

  async function dispatch(id: string) {
    setSending(true);
    try {
      for (let remaining = Number.MAX_SAFE_INTEGER; remaining > 0;) {
        const response = await fetch(`/api/admin/marketing/${id}/send`, { method: "POST" });
        const result = await response.json() as { error?: string; campaign?: Pick<AdminCampaign, "pending" | "sent" | "failed" | "skipped"> };
        if (response.status === 401) { router.replace("/admin/login"); return; }
        if (!response.ok || !result.campaign) throw new Error(result.error || "Sending paused. Resume when ready.");
        setCampaign((current) => current?.id === id ? { ...current, ...result.campaign } : current);
        if (result.campaign.pending >= remaining) throw new Error("Sending made no progress. Please refresh and retry.");
        remaining = result.campaign.pending;
      }
      setNotice("Campaign finished. See delivery counts below.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Sending paused."); }
    finally { setSending(false); }
  }

  async function createAndSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (campaign && campaign.pending > 0) { setNotice("Finish the pending campaign before starting another."); return; }
    if (!window.confirm(`Send this marketing email to ${subscriberCount} opted-in subscriber${subscriberCount === 1 ? "" : "s"}?`)) return;
    setNotice(""); setSending(true);
    try {
      const response = await fetch("/api/admin/marketing", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const result = await response.json() as { error?: string; campaign?: AdminCampaign };
      if (response.status === 401) { router.replace("/admin/login"); return; }
      if (!response.ok || !result.campaign) throw new Error(result.error || "Could not prepare campaign.");
      setCampaign(result.campaign);
      await dispatch(result.campaign.id);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not prepare campaign."); }
    finally { setSending(false); }
  }

  async function retryFailed() {
    if (!campaign || !window.confirm(`Retry ${campaign.failed} failed email${campaign.failed === 1 ? "" : "s"}?`)) return;
    setSending(true); setNotice("");
    try {
      const response = await fetch(`/api/admin/marketing/${campaign.id}/send`, { method: "PATCH" });
      if (!response.ok) throw new Error("Could not queue failed emails again.");
      await dispatch(campaign.id);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Retry failed."); }
    finally { setSending(false); }
  }

  return <section className={styles.section}>
    <div className={styles.heading}><div><span className={styles.kicker}>LEAF GENIX POST</span><h1>Write the words. We’ll dress them well.</h1><p>Your subject and message become a branded, mobile-friendly email automatically.</p></div><span className={styles.headingIcon}><Mail size={29} /></span></div>
    <div className={styles.audience}><div><strong>{subscriberCount}</strong><span>subscribers with promotional-email consent</span></div><p>Only welcome-coupon signups who opted in are included. Every message has an unsubscribe link. Ordinary enquiries are never added automatically.</p></div>
    <div className={styles.composerGrid}>
      <form className={styles.card} onSubmit={createAndSend}><span className={styles.kicker}>COMPOSE</span><h2>Your next note</h2><label className={styles.field}>Subject<input required minLength={5} maxLength={120} value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="A little something for your wellness routine" /></label><label className={styles.field}>Message<textarea required minLength={20} maxLength={4000} rows={11} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write your message here. Paragraph breaks will be kept in the email…" /></label><p className={styles.help}>The logo, layout, CTA, support details and unsubscribe footer are added for you.</p><button className={styles.primary} type="submit" disabled={sending || !subscriberCount || Boolean(campaign?.pending)}>{sending ? <Loader2 size={17} className={styles.spin} /> : <Send size={17} />}{sending ? "Sending in safe batches…" : campaign?.pending ? "Resume the pending send first" : `Review & send to ${subscriberCount}`}</button>{notice ? <p className={styles.feedback} role="status">{notice}</p> : null}</form>
      <div className={styles.previewFrame}><span className={styles.kicker}>LIVE PREVIEW</span><div className={styles.emailPreview}><div className={styles.emailTop}><span className={styles.emailMark}><Image src="/leafgenix-mark.png" alt="" width={42} height={42} /></span><div><strong>Leaf Genix Lifesciences</strong><small>Lifting and Empowering All Families</small></div></div><div className={styles.emailBody}><span className={styles.emailEyebrow}>CARE, DELIVERED WITH CLARITY</span><p>Hi [customer name],</p><h2>{subject || "Your subject comes alive here"}</h2>{body ? body.trim().split(/\n\s*\n/).map((paragraph, index) => <p key={index} className={styles.previewParagraph}>{paragraph}</p>) : <p className={styles.previewMuted}>Your message will appear here in a clean, readable layout.</p>}<span className={styles.fakeCta}>Explore Leaf Genix <ArrowRight size={14} /></span></div><div className={styles.emailFooter}>Need a hand? Reply to this email or contact our support team.<br /><small>Unsubscribe from marketing emails</small></div></div></div>
    </div>
    {campaign ? <div className={styles.card}><div className={styles.cardHeader}><div><span className={styles.kicker}>LATEST SEND</span><h2>{campaign.subject}</h2></div><span>{new Date(campaign.created_at).toLocaleDateString("en-IN")}</span></div><div className={styles.deliveryMetrics}><div><strong>{campaign.sent}</strong><span>Sent</span></div><div><strong>{campaign.pending}</strong><span>Pending</span></div><div><strong>{campaign.failed}</strong><span>Failed</span></div><div><strong>{campaign.skipped}</strong><span>Unsubscribed / skipped</span></div></div><div className={styles.actions}>{campaign.pending > 0 ? <button className={styles.secondary} disabled={sending} onClick={() => dispatch(campaign.id)}><RotateCcw size={15} />Resume send</button> : null}{campaign.failed > 0 ? <button className={styles.secondary} disabled={sending} onClick={retryFailed}><RotateCcw size={15} />Retry failed</button> : null}{campaign.pending === 0 && campaign.failed === 0 ? <span className={styles.success}><Check size={15} />Mailing complete</span> : null}</div></div> : null}
  </section>;
}
