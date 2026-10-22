"use client";

import { isPushSupported, serializeSubscription, subscribe, unsubscribe } from "@mmmike/web-push/client";
import { BellRing, BellOff, Loader2, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

import styles from "@/components/admin-dashboard.module.css";

type PushState = "loading" | "ready" | "enabled" | "unsupported" | "unconfigured" | "error";

export function AdminPushControl() {
  const [state, setState] = useState<PushState>("loading");
  const [publicKey, setPublicKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isIphone, setIsIphone] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsIphone(/iPhone|iPad|iPod/i.test(navigator.userAgent));
      if (!isPushSupported()) { if (active) setState("unsupported"); return; }
      try {
        const response = await fetch("/api/admin/push", { cache: "no-store" });
        if (!response.ok) throw new Error("Could not check alert settings.");
        const config = await response.json() as { configured: boolean; publicKey: string | null };
        if (!active) return;
        if (!config.configured || !config.publicKey) { setState("unconfigured"); return; }
        setPublicKey(config.publicKey);
        const registration = await navigator.serviceWorker.getRegistration("/admin/");
        const existing = registration ? await registration.pushManager.getSubscription() : null;
        if (!active) return;
        if (existing) {
          const saved = await fetch("/api/admin/push", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(serializeSubscription(existing)),
          });
          setState(saved.ok ? "enabled" : "ready");
        } else setState("ready");
      } catch { if (active) { setState("error"); setMessage("Could not check phone alerts. Please retry."); } }
    }
    void load();
    return () => { active = false; };
  }, [retryCount]);

  function retry() {
    setMessage("");
    setState("loading");
    setRetryCount((count) => count + 1);
  }

  async function enable() {
    setBusy(true); setMessage("");
    try {
      await navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin/" });
      const result = await subscribe(publicKey);
      if (result.status === "unsupported") throw new Error("This browser does not support push alerts.");
      if (result.status === "denied") throw new Error("Notifications are blocked. Allow them in your phone browser settings.");
      const response = await fetch("/api/admin/push", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serializeSubscription(result.subscription)),
      });
      if (!response.ok) {
        const body = await response.json() as { error?: string };
        throw new Error(body.error || "Could not save this phone.");
      }
      setState("enabled");
      setMessage("Phone alerts are on for new paid orders.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not enable alerts."); }
    finally { setBusy(false); }
  }

  async function disable() {
    setBusy(true); setMessage("");
    try {
      const endpoint = await unsubscribe();
      if (endpoint) {
        const response = await fetch("/api/admin/push", {
          method: "DELETE", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });
        if (!response.ok) throw new Error("Phone alert was stopped here, but server cleanup failed.");
      }
      setState("ready");
      setMessage("Alerts turned off on this device.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not disable alerts."); }
    finally { setBusy(false); }
  }

  return <section className={styles.pushCard} aria-label="Phone alerts">
    <div className={styles.pushIcon}><Smartphone size={21} /></div>
    <div className={styles.pushCopy}>
      <span className={styles.eyebrow}>STAY IN THE LOOP</span>
      <h2>New order? Know instantly.</h2>
      <p>Get a private push alert on this phone when a payment is confirmed. Admin email remains your backup.</p>
      {state === "unsupported" ? <small>{isIphone ? "On iPhone, open the admin portal from a Home Screen shortcut to enable alerts." : "This browser does not support push alerts. Try Chrome on Android or a Home Screen shortcut on iPhone."}</small> : null}
      {state === "unconfigured" ? <small>Alert setup is incomplete on the server. Try again in a moment.</small> : null}
      {message ? <small role="status">{message}</small> : null}
      {showGuide ? <div className={styles.pushGuide}>
        <strong>{isIphone ? "Enable alerts on iPhone" : "Enable alerts on your phone"}</strong>
        <ol>{isIphone ? <><li>Open leafgenix.in in Safari.</li><li>Tap Share, then Add to Home Screen.</li><li>Open LeafGenix from the new icon, sign in to Admin, and tap Enable phone alerts.</li></> : <><li>Open leafgenix.in in Chrome on your phone.</li><li>Sign in to Admin and tap Enable phone alerts.</li><li>Allow notifications when your phone asks.</li></>}</ol>
      </div> : null}
    </div>
    {state === "ready" && publicKey ? <button type="button" className={styles.pushButton} disabled={busy} onClick={enable}>{busy ? <Loader2 size={16} /> : <BellRing size={16} />} Enable phone alerts</button> : null}
    {state === "enabled" ? <button type="button" className={styles.pushSecondary} disabled={busy} onClick={disable}>{busy ? <Loader2 size={16} /> : <BellOff size={16} />} Alerts on · Turn off</button> : null}
    {state === "unsupported" ? <button type="button" className={styles.pushButton} aria-expanded={showGuide} onClick={() => setShowGuide((visible) => !visible)}><BellRing size={16} /> {showGuide ? "Hide setup steps" : "Set up phone alerts"}</button> : null}
    {state === "loading" ? <button type="button" className={styles.pushSecondary} disabled><Loader2 size={16} /> Checking alerts…</button> : null}
    {state === "unconfigured" || state === "error" || (state === "ready" && !publicKey) ? <button type="button" className={styles.pushSecondary} onClick={retry}><BellRing size={16} /> Retry alert setup</button> : null}
  </section>;
}
