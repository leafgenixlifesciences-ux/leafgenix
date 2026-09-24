"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PasswordField } from "@/components/password-field";
import { authMessage, passwordProblem, MIN_PASSWORD_LENGTH } from "@/lib/auth-errors";

/**
 * Two screens in one component, chosen by whether a session exists:
 *
 *   no session  → ask for the email and send a reset link
 *   session     → set the new password (arrived via the link, or already
 *                 signed in and simply changing it)
 */
export function ResetPasswordForm({ hasSession }: { hasSession: boolean }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        },
      );
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(
        authMessage(err instanceof Error ? err.message : "Please try again."),
      );
    } finally {
      setBusy(false);
    }
  }

  async function setNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const problem = passwordProblem(password);
    if (problem) return setError(problem);
    if (password !== confirm) return setError("The two passwords don't match.");

    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(
        authMessage(err instanceof Error ? err.message : "Please try again."),
      );
    } finally {
      setBusy(false);
    }
  }

  /* ---------------------------------------------------------------- */

  if (done) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-brand" strokeWidth={1.5} />
        <h2 className="display-md mt-5">Password updated</h2>
        <p className="mx-auto mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-body">
          You&apos;re signed in with your new password. It applies everywhere
          you use this account.
        </p>
        <Link href="/account" className="btn btn-primary mt-6">
          Go to your orders
        </Link>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="card p-8 text-center">
        <MailCheck className="mx-auto h-9 w-9 text-brand" strokeWidth={1.5} />
        <h2 className="display-md mt-5">Check your inbox</h2>
        <p className="mx-auto mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-body">
          If an account exists for{" "}
          <span className="font-medium text-ink">
            {email.trim().toLowerCase()}
          </span>
          , we&apos;ve sent it a link to set a new password. It expires in an
          hour.
        </p>
        <Link
          href="/login"
          className="focus-ring mt-6 inline-block text-sm text-brand underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  const errorBlock = error && (
    <p
      role="alert"
      className="flex gap-2.5 rounded-xl border border-alert/35 bg-alert/8 p-3.5 text-sm text-body"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-alert" strokeWidth={1.8} />
      {error}
    </p>
  );

  if (hasSession) {
    return (
      <form onSubmit={setNewPassword} className="card space-y-4 p-7 md:p-8">
        <PasswordField
          label="New password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          disabled={busy}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters, with a letter and a number.`}
        />
        <PasswordField
          label="Confirm new password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          disabled={busy}
        />

        {errorBlock}

        <button type="submit" disabled={busy} className="btn btn-primary w-full">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              Saving…
            </>
          ) : (
            "Save new password"
          )}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={sendLink} className="card space-y-4 p-7 md:p-8">
      <div>
        <label className="label" htmlFor="reset-email">
          Email address
        </label>
        <input
          id="reset-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="field"
          disabled={busy}
        />
      </div>

      {errorBlock}

      <button type="submit" disabled={busy} className="btn btn-primary w-full">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            Sending…
          </>
        ) : (
          "Email me a reset link"
        )}
      </button>

      <p className="text-center text-sm text-muted">
        Remembered it?{" "}
        <Link
          href="/login"
          className="focus-ring text-brand underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
