import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, KeyRound, Mail } from "lucide-react";
import { useAuth } from "@/features/user/auth/authContext";
import {
  AuthDivider,
  AuthField,
  AuthShell,
  UnconfiguredNotice,
} from "@/features/user/components/AuthShell";
import { authInputClass } from "@/features/user/components/authInputs";
import { Button } from "@/components/ui/Button";
import { toFriendlyAuthError } from "@/features/user/utils/authErrors";

const GOOGLE_ICON = (
  <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M12 5.04c1.66 0 3.14.57 4.31 1.69l3.2-3.2C17.64 1.86 15.06.75 12 .75 7.5.75 3.6 3.2 1.63 6.84l3.72 2.89C6.2 7.1 8.85 5.04 12 5.04Z"
    />
    <path
      fill="#4285F4"
      d="M23.25 12.27c0-.9-.08-1.55-.25-2.27H12v4.32h6.42c-.13 1.1-.84 2.76-2.4 3.88l3.66 2.84c2.2-2.03 3.57-5.03 3.57-8.77Z"
    />
    <path
      fill="#FBBC05"
      d="M5.36 14.26a6.9 6.9 0 0 1-.37-2.26c0-.79.13-1.55.36-2.27L1.63 6.84A11.25 11.25 0 0 0 .75 12c0 1.82.44 3.53 1.22 5.04l3.39-2.78Z"
    />
    <path
      fill="#34A853"
      d="M12 23.25c3.06 0 5.64-1 7.5-2.72l-3.66-2.84c-1.02.71-2.37 1.2-3.84 1.2-3.15 0-5.8-2.06-6.75-4.9l-3.72 2.89c1.97 3.63 5.87 6.37 10.47 6.37Z"
    />
  </svg>
);

export function LoginPage() {
  const { configured, signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Enter your email.";
    else if (!emailValid) next.email = "That doesn't look like a valid email.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrors({ form: toFriendlyAuthError(err) });
    } finally {
      setSubmitting(false);
    }
  };

  if (!configured) {
    return (
      <AuthShell title="Sign in" subtitle="Continue your Git journey.">
        <UnconfiguredNotice />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back. Continue where you left off."
      footer={
        <p className="text-sm text-text-muted">
          New to Panda?{" "}
          <Link to="/signup" className="font-medium text-accent-hover hover:text-accent">
            Create an account
          </Link>
        </p>
      }
    >
      {errors.form && (
        <div
          role="alert"
          className="mb-0.5 rounded-xl border border-danger/30 bg-danger-soft/30 px-3.5 py-2.5 text-sm text-danger"
        >
          {errors.form}
        </div>
      )}

      <Button
        variant="secondary"
        onClick={() => void signInWithGoogle()}
        className="h-10 w-full"
        leftIcon={GOOGLE_ICON}
      >
        Continue with Google
      </Button>

      <AuthDivider>or</AuthDivider>

      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <AuthField
          label="Email"
          error={errors.email}
          icon={<Mail className="size-4" aria-hidden="true" />}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: undefined, form: undefined }));
            }}
            required
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            className={authInputClass(Boolean(errors.email))}
          />
        </AuthField>

        <AuthField
          label="Password"
          error={errors.password}
          icon={<KeyRound className="size-4" aria-hidden="true" />}
        >
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: undefined, form: undefined }));
            }}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            className={authInputClass(Boolean(errors.password))}
          />
        </AuthField>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/reset-password")}
            className="-mr-1 rounded-md px-1 py-0.5 text-[13px] font-medium text-text-muted transition-colors hover:text-text"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" loading={submitting} className="h-10 w-full" rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}>
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
