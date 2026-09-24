import { redirect } from "next/navigation";
import { safeInternalPath } from "@/lib/safe-path";

export const dynamic = "force-dynamic";

/** A friendly /signup URL; the form itself lives on /login with both tabs. */
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = safeInternalPath(next, "/account");
  redirect(`/login?mode=signup&next=${encodeURIComponent(safeNext)}`);
}
