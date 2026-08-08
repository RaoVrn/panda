import { useEffect, useState, type FormEvent } from "react";
import { KeyRound, Mail } from "lucide-react";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/features/user/auth/authContext";
import { AuthShell, UnconfiguredNotice } from "@/features/user/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const INPUT =
  "h-10 w-full rounded-lg border border-border-subtle bg-base-subtle px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted transition-colors focus:border-border-strong focus:bg-base-subtle focus:outline-none focus:ring-2 focus:ring-accent/20";

export function ResetPasswordPage() {
  const { configured, resetPassword, updatePassword } = useAuth();
  const [mode, setMode] = useState<"request" | "set">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // When the reset email link is clicked, Supabase appends a recovery token
  // to the URL hash. Exchange it for a session, then let the user set a
  // new password.
  useEffect(() => {
    if (!configured) return;
    const hash = window.location.hash;
    const accessToken = /access_token=([^&]+)/.exec(hash)?.[1];
    const refreshToken = /refresh_token=([^&]+)/.exec(hash)?.[1];
    if (!accessToken || !refreshToken) return;
    const supabase = getSupabase();
    if (!supabase) return;
    void supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error: setErrorResult }) => {
        if (!setErrorResult) setMode("set");
      });
    window.history.replaceState({}, "", "/reset-password");
  }, [configured]);

  const request = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      await resetPassword(email);
      setMessage("Check your email for a reset link.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send a reset link.");
    } finally {
      setSubmitting(false);
    }
  };

  const setNewPassword = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await updatePassword(password);
      setMessage("Password updated. You can sign in now.");
      setMode("request");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update your password.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!configured) {
    return (
      <AuthShell title="Reset your password" subtitle="We'll email you a reset link.">
        <UnconfiguredNotice />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={mode === "request" ? "Reset your password" : "Choose a new password"}
      subtitle={
        mode === "request"
          ? "Enter your email and we'll send you a reset link."
          : "Your new password must be at least 6 characters."
      }
    >
      {mode === "request" ? (
        <form onSubmit={request} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-text">
            Email
            <span className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className={cn(INPUT, "pl-10")}
              />
            </span>
          </label>
          {message && <p className="text-sm text-accent-hover">{message}</p>}
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={submitting} className="h-10">
            Send reset link
          </Button>
        </form>
      ) : (
        <form onSubmit={setNewPassword} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-text">
            New password
            <span className="relative">
              <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className={cn(INPUT, "pl-10")}
              />
            </span>
          </label>
          {message && <p className="text-sm text-accent-hover">{message}</p>}
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={submitting} className="h-10">
            Update password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
