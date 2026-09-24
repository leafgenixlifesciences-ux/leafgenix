"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PasswordField } from "@/components/password-field";
import { authMessage, passwordProblem, MIN_PASSWORD_LENGTH } from "@/lib/auth-errors";
import { safeInternalPath } from "@/lib/safe-path";

type Mode = "signin" | "signup";

/**
 * Email + password authentication, handled by Supabase Auth.
 *
 * Passwords are never stored, hashed or compared by this application: the
 * credentials go straight to Supabase's auth service over TLS and we only ever
 * see the session it hands back. That is deliberate — rolling our own password
 * store would be strictly worse than using an audited one.
 */
export function AuthForm({
  next = "/account",
  initialMode = "signin",
}: {
  next?: string;
  initialMode?: Mode;
}) {
  const router = useRouter();

  // The page already sanitises this, but this component is what actually
  // navigates, so it re-checks rather than trusting its caller.
  const destination = safeInternalPath(next, "/account");

  const [mode, setMode] = useState<Mode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Set only when the project requires email confirmation before first login. */
  const [confirmSent, setConfirmSent] = useState(false);

  function switchMode(to: Mode) {
    setMode(to);
    setError(null);
    setPassword("");
    setConfirm("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    if (mode === "signup") {
      const problem = passwordProblem(password);
      if (problem) return setError(problem);
      if (password !== confirm)
        return setError("The two passwords don't match.");
      if (fullName.trim().length < 2)
        return setError("Please enter your name.");
    }

    setBusy(true);
    try {
      const supabase = createClient();

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            // Read by the handle_new_user trigger to seed public.profiles.
            data: {
              full_name: fullName.trim(),
              phone: phone.trim().replace(/[\s-]/g, "").replace(/^(\+91|0)/, ""),
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`,
          },
        });
        if (error) throw error;

        // With email confirmation switched off, Supabase returns a session and
        // the customer is simply signed in. With it on, there is no session yet
        // and they need to open the link first. Both are handled.
        if (!data.session) {
          setBusy(false);
          setConfirmSent(true);
          return;
        }
      }

      router.replace(destination);
      router.refresh();
    } catch (err) {
      setBusy(false);
      setError(
        authMessage(
          err instanceof Error ? err.message : "Something went wrong. Please try again.",
        ),
      );
    }
  }

  if (confirmSent) {
    return (
      <div className="card p-8 text-center">
        <MailCheck className="mx-auto h-9 w-9 text-brand" strokeWidth={1.5} />
        <h2 className="display-md mt-5">Confirm your email</h2>
        <p className="mx-auto mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-body">
          We&apos;ve sent a confirmation link to{" "}
          <span className="font-medium text-ink">{email.trim().toLowerCase()}</span>.
          Open it and your account is ready — then sign in with the password you
          just chose.
        </p>
        <button
          onClick={() => {
            setConfirmSent(false);
            switchMode("signin");
          }}
          className="focus-ring mt-6 text-sm text-brand underline underline-offset-4"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  const signup = mode === "signup";

  return (
    <div className="card overflow-hidden">
      {/* ---- mode switch ---- */}
      <div
        role="tablist"
        aria-label="Sign in or create an account"
        className="grid grid-cols-2 border-b border-line bg-tint"
      >
        {(
          [
            ["signin", "Sign in"],
            ["signup", "Create account"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            role="tab"
            type="button"
            aria-selected={mode === value}
            onClick={() => switchMode(value)}
            className={`focus-ring relative px-4 py-3.5 text-sm font-semibold transition-colors ${
              mode === value
                ? "bg-white text-brand-deep"
                : "text-muted hover:text-brand"
            }`}
          >
            {label}
            {mode === value && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-accent"
              />
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-7 md:p-8">
        {signup && (
          <div>
            <label className="label" htmlFor="auth-name">
              Full name
            </label>
            <input
              id="auth-name"
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name as on the delivery address"
              className="field"
              disabled={busy}
            />
          </div>
        )}

        <div>
          <label className="label" htmlFor="auth-email">
            Email address
          </label>
          <input
            id="auth-email"
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

        {signup && (
          <div>
            <label className="label" htmlFor="auth-phone">
              Mobile number <span className="text-faint">(optional)</span>
            </label>
            <div className="flex gap-2">
              <span className="grid shrink-0 place-items-center rounded-xl border border-line bg-tint px-3.5 text-sm text-muted">
                +91
              </span>
              <input
                id="auth-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                className="field"
                disabled={busy}
              />
            </div>
          </div>
        )}

        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete={signup ? "new-password" : "current-password"}
          disabled={busy}
          hint={
            signup
              ? `At least ${MIN_PASSWORD_LENGTH} characters, with a letter and a number.`
              : undefined
          }
        />

        {signup && (
          <PasswordField
            label="Confirm password"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            disabled={busy}
          />
        )}

        {!signup && (
          <p className="text-right">
            <Link
              href="/reset-password"
              className="focus-ring text-sm text-brand underline underline-offset-4"
            >
              Forgot your password?
            </Link>
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="flex gap-2.5 rounded-xl border border-alert/35 bg-alert/8 p-3.5 text-sm text-body"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-alert"
              strokeWidth={1.8}
            />
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn btn-primary w-full">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              {signup ? "Creating your account…" : "Signing you in…"}
            </>
          ) : signup ? (
            "Create account"
          ) : (
            "Sign in"
          )}
        </button>

        <p className="text-xs leading-relaxed text-muted">
          {signup ? (
            <>
              Creating an account is optional — you can check out as a guest. By
              continuing you agree to our{" "}
              <Link
                href="/terms"
                className="text-brand underline underline-offset-2"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="text-brand underline underline-offset-2"
              >
                Privacy Policy
              </Link>
              .
            </>
          ) : (
            <>
              New here?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="focus-ring text-brand underline underline-offset-2"
              >
                Create an account
              </button>{" "}
              to keep your orders and addresses in one place.
            </>
          )}
        </p>
      </form>
    </div>
  );
}
