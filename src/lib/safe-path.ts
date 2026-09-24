/**
 * Anything that ends up in a `Location:` header or in `router.replace()` has to
 * be proven internal first.
 *
 * A `startsWith("/")` check is not enough: `//evil.com` and `/\evil.com` both
 * pass it, and every browser resolves both to an external origin. The only
 * reliable test is to resolve the value against a throwaway base and confirm
 * the origin did not move.
 */
const SENTINEL = "https://internal.invalid";

/** Control characters, spaces and DEL can smuggle a second URL or a second
 *  header past a lenient parser, so a path containing any of them is refused. */
function hasUnsafeChars(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 32 || code === 127) return true;
  }
  return false;
}

export function safeInternalPath(
  value: string | null | undefined,
  fallback = "/account",
): string {
  if (!value || typeof value !== "string") return fallback;
  if (hasUnsafeChars(value)) return fallback;
  if (!value.startsWith("/")) return fallback;

  try {
    const resolved = new URL(value, SENTINEL);
    if (resolved.origin !== SENTINEL) return fallback;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}
