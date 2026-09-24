"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus("sending");

    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          subject: String(fd.get("subject") ?? ""),
          message: String(fd.get("message") ?? ""),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not send your message");
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-brand" strokeWidth={1.5} />
        <h2 className="display-md mt-5">Message received</h2>
        <p className="mx-auto mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-body">
          Someone from customer care will reply within one working day. If it is
          about an existing order, keep the order number handy.
        </p>
      </div>
    );
  }

  const busy = status === "sending";

  return (
    <form onSubmit={handleSubmit} className="card p-7 md:p-8">
      <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2">
        <legend className="sr-only">Contact form</legend>

        <div>
          <label className="label" htmlFor="name">
            Your name
          </label>
          <input id="name" name="name" required autoComplete="name" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="c-email">
            Email
          </label>
          <input
            id="c-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="c-phone">
            Phone <span className="font-normal text-faint">(optional)</span>
          </label>
          <input
            id="c-phone"
            name="phone"
            inputMode="tel"
            autoComplete="tel"
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="subject">
            Subject
          </label>
          <select
            id="subject"
            name="subject"
            defaultValue="Product question"
            className="field appearance-none"
          >
            {[
              "Product question",
              "Order or delivery",
              "Returns and refunds",
              "Batch certificate request",
              "Wholesale / distribution",
              "Something else",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            minLength={10}
            maxLength={2000}
            placeholder="Tell us what you need. If it's about an order, include the order number."
            className="field resize-none"
          />
        </div>
      </fieldset>

      {error && (
        <p
          role="alert"
          className="mt-5 flex gap-2.5 rounded-xl border border-alert/35 bg-alert/8 p-3.5 text-sm text-body"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-alert" strokeWidth={1.8} />
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn btn-primary mt-6">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" strokeWidth={1.8} />
            Send message
          </>
        )}
      </button>
    </form>
  );
}
