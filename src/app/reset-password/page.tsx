import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { PageHero } from "@/components/page-hero";

import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  // Arriving from the emailed link means /auth/callback has already exchanged
  // the code for a session, so a user here is one entitled to set a password.
  const hasSession = Boolean(await getSessionUser());

  return (
    <>
    <PageHero
      eyebrow="Account"
      title={hasSession ? "Choose a new password" : "Reset your password"}
      lede={hasSession
        ? "Pick something you'll remember. You'll stay signed in on this device."
        : "Tell us the email on your account and we'll send you a link to set a new password."}
      compact
      align="center"
    />
    <section className="band-mint py-12 md:py-16">
      <div className="mx-auto max-w-md px-[var(--gutter)]">
        <ResetPasswordForm hasSession={hasSession} />
      </div>
    </section>
    </>
  );
}
