/** Maps raw Supabase/network errors to friendly, human messages. */

export function toFriendlyAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (message.includes("not configured") || message.includes("Supabase is not configured")) {
    return "Accounts aren't set up yet on this build.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "An account with that email already exists.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please confirm your email address first.";
  }
  if (lower.includes("at least 6 characters")) {
    return "Password must be at least 6 characters.";
  }
  if (lower.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("failed to fetch")) {
    return "Network error. Check your connection and try again.";
  }
  if (lower.includes("unable to validate")) {
    return "That looks like an invalid email address.";
  }
  return message;
}
