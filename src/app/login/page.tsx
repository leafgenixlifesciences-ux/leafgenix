import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { PageHero } from "@/components/page-hero";

import { getSessionUser } from "@/lib/auth";
import { safeInternalPath } from "@/lib/safe-path";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in or create an account",
  description:
    "Sign in with your email and password to see your LeafGenix order history, or create an account in a few seconds.",
  robots: { index: false, follow: true },
};

const notices: Record<string, string> = {
  link_expired:
    "That link has expired or has already been used. Please request a new one.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; mode?: string; error?: string }>;
}) {
  const { next, mode, error } = await searchParams;
  // `next` lands in a Location header. A startsWith("/") test is not enough:
  // "//evil.com" and "/\\evil.com" both pass it and both resolve to an external
  // origin, which turns this page into an open redirect.
  const safeNext = safeInternalPath(next, "/account");
  const initialMode = mode === "signup" ? "signup" : "signin";
  const notice = error ? notices[error] : undefined;

  const user = await getSessionUser();
  if (user) redirect(safeNext);

  return (
    <>
    <PageHero
      eyebrow="Account"
      title={initialMode === "signup" ? "Create your account" : "Sign in"}
      lede="Accounts are optional — they just keep your order history and addresses in one place."
      compact
      align="center"
    />
    <section className="band-mint py-12 md:py-16">
      <div className="mx-auto max-w-md px-[var(--gutter)]">

        {notice && (
          <p
            role="alert"
            className="mt-6 flex gap-2.5 rounded-xl border border-alert/35 bg-alert/8 p-3.5 text-sm text-body"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-alert"
              strokeWidth={1.8}
            />
            {notice}
          </p>
        )}

        <div className="mt-8">
          <AuthForm next={safeNext} initialMode={initialMode} />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Just want to buy something?{" "}
          <Link
            href="/products"
            className="focus-ring text-brand underline underline-offset-4"
          >
            Shop as a guest
          </Link>
        </p>
      </div>
    </section>
    </>
  );
}
