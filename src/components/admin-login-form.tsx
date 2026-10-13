"use client";

import { Eye, EyeOff, Leaf, Loader2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: String(form.get("username") ?? ""),
          password: String(form.get("password") ?? ""),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Login failed.");
      router.replace("/admin");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={login} className="mt-9 space-y-5">
      <div>
        <label htmlFor="admin-username" className="mb-2 block text-sm font-bold text-[#183f2d]">
          Admin ID
        </label>
        <div className="relative">
          <Leaf className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-[#6c7f74]" />
          <input
            id="admin-username"
            name="username"
            autoComplete="username"
            required
            autoFocus
            className="min-h-14 w-full rounded-2xl border border-[#cbdacf] bg-white pr-4 pl-12 text-[#0b1a12] outline-none transition focus:border-[#005c2d] focus:ring-4 focus:ring-[#005c2d]/10"
            placeholder="Enter your admin ID"
          />
        </div>
      </div>

      <div>
        <label htmlFor="admin-password" className="mb-2 block text-sm font-bold text-[#183f2d]">
          Password
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-[#6c7f74]" />
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            minLength={8}
            className="min-h-14 w-full rounded-2xl border border-[#cbdacf] bg-white pr-12 pl-12 text-[#0b1a12] outline-none transition focus:border-[#005c2d] focus:ring-4 focus:ring-[#005c2d]/10"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute top-1/2 right-3 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-[#6c7f74] hover:bg-[#edf4ee] hover:text-[#005c2d]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-[#d93c30]/20 bg-[#fff2ef] px-4 py-3 text-sm font-semibold text-[#a9251d]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#004f2a] px-5 font-extrabold text-white shadow-[0_18px_35px_-20px_rgba(0,79,42,.75)] transition hover:bg-[#006837] focus:outline-none focus:ring-4 focus:ring-[#b8d93b]/45 disabled:cursor-wait disabled:opacity-65"
      >
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <LockKeyhole className="h-5 w-5 text-[#c9e82d]" />}
        {pending ? "Opening command centre…" : "Open admin portal"}
      </button>
    </form>
  );
}
