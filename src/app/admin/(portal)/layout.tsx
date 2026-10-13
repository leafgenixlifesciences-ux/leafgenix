import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Operations portal",
  robots: { index: false, follow: false },
};

export default async function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  if (!(await getAdminSession())) redirect("/admin/login");
  return <>{children}</>;
}
