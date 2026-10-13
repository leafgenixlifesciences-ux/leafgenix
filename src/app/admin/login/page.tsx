import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Activity, BadgeCheck, Boxes, ShieldCheck } from "lucide-react";

import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-[#eff4ee]">
      <main className="grid min-h-full lg:grid-cols-[1.06fr_.94fr]">
        <section className="relative hidden overflow-hidden bg-[#003c23] p-12 text-white lg:flex lg:flex-col xl:p-16">
          <div className="absolute inset-0 opacity-30 [background-image:var(--leafline)]" />
          <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-[#9ac327]/20 blur-3xl" />
          <Image
            src="/leafgenix-lockup.png"
            alt="Leaf Genix Lifesciences"
            width={1025}
            height={260}
            priority
            className="relative h-auto w-64 brightness-0 invert"
          />
          <div className="relative my-auto max-w-2xl py-16">
            <p className="text-sm font-extrabold text-[#c9e82d]">Operations command centre</p>
            <h1 className="mt-5 font-display text-6xl leading-[.94] font-extrabold tracking-[-.055em] xl:text-7xl">
              Every order.<br />One clear view.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/70">
              Follow leads from first contact to fulfilment, keep delivery information current, and give every customer a timely update.
            </p>
          </div>
          <div className="relative grid grid-cols-3 gap-3 border-t border-white/15 pt-6 text-sm text-white/68">
            <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-[#c9e82d]" /> Live orders</span>
            <span className="flex items-center gap-2"><Boxes className="h-4 w-4 text-[#c9e82d]" /> Fulfilment</span>
            <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-[#c9e82d]" /> Customer care</span>
          </div>
        </section>

        <section className="flex min-h-full items-center justify-center p-5 sm:p-10">
          <div className="w-full max-w-[31rem] rounded-[2rem] border border-[#d9e5dc] bg-[#fbfdf9] p-6 shadow-[0_35px_90px_-45px_rgba(0,60,35,.4)] sm:p-10">
            <div className="mb-9 flex items-center justify-between lg:hidden">
              <Image src="/leafgenix-lockup.png" alt="Leaf Genix Lifesciences" width={1025} height={260} priority className="h-auto w-48" />
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#004f2a] text-[#c9e82d]"><ShieldCheck className="h-5 w-5" /></span>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#005c2d]/15 bg-[#e9f3e9] px-3 py-1.5 text-xs font-extrabold text-[#005c2d]">
              <span className="h-2 w-2 rounded-full bg-[#6f9518]" /> Restricted access
            </span>
            <h2 className="mt-5 font-display text-[2.5rem] leading-none font-extrabold tracking-[-.045em] text-[#003c23] sm:text-5xl">
              Welcome back.
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-[#64776c]">
              Sign in to manage LeafGenix leads, paid orders and delivery progress.
            </p>
            <AdminLoginForm />
            <p className="mt-7 flex items-center justify-center gap-2 text-center text-xs text-[#788a80]">
              <ShieldCheck className="h-4 w-4" /> Session expires automatically after 8 hours.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
