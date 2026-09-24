/**
 * Supabase returns terse, developer-facing auth errors. Nobody buying a
 * vitamin should read "Invalid login credentials", so every message a
 * customer can trigger is translated here — once, in one place.
 *
 * Anything unrecognised falls through to the original text rather than a
 * generic "something went wrong", so a genuinely unexpected failure is still
 * diagnosable from a screenshot.
 */
export function authMessage(raw: string): string {
  const m = raw.toLowerCase();

  if (m.includes("invalid login credentials"))
    return "That email and password don't match. Please check both and try again.";

  if (m.includes("email not confirmed"))
    return "Please confirm your email first — open the link we sent you, then sign in.";

  if (m.includes("user already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Sign in instead, or reset your password.";

  if (m.includes("password should be at least"))
    return "Your password is too short. Please use at least 8 characters.";

  if (m.includes("weak password") || m.includes("password is known to be weak"))
    return "That password is too easy to guess. Please choose a stronger one.";

  if (m.includes("for security purposes") || m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts just now. Please wait a minute and try again.";

  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "That doesn't look like a valid email address.";

  if (m.includes("same password"))
    return "Please choose a password different from your current one.";

  if (m.includes("failed to fetch") || m.includes("network"))
    return "We couldn't reach the server. Please check your connection and try again.";

  return raw;
}

/** The one place the password rule is defined. */
export const MIN_PASSWORD_LENGTH = 8;

export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH)
    return `Please use at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password))
    return "Please include at least one letter and one number.";
  return null;
}
