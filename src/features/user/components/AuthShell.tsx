import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

/** One field in the auth card: label, icon, input, inline error. */
export function AuthField({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-text">
      <span className="flex items-center justify-between">
        {label}
        {error && (
          <span className="text-xs font-normal text-danger" role="alert">
            {error}
          </span>
        )}
      </span>
      <span className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
          {icon}
        </span>
        {children}
      </span>
    </label>
  );
}

/** Balanced divider used between the Google option and email sign-in. */
export function AuthDivider({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-text-muted">
      <span className="h-px flex-1 bg-border-subtle" aria-hidden="true" />
      {children}
      <span className="h-px flex-1 bg-border-subtle" aria-hidden="true" />
    </div>
  );
}

/**
 * Premium centered auth card used by sign in / sign up / reset. Sized to fit a
 * single screen on a 13-inch laptop: compact header, tight card, centered.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-md">
        <div className="mb-5 flex flex-col items-center">
          <Link
            to="/"
            className="flex size-10 items-center justify-center rounded-xl bg-accent-soft transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="Panda home"
          >
            <Logo size={26} />
          </Link>
          <p className="mt-2 text-lg font-semibold tracking-tight text-text">Panda</p>
          <p className="mt-0.5 text-[13px] text-text-muted">Your Git mentor</p>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-card">
          <h1 className="text-lg font-semibold tracking-tight text-text sm:text-xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-text-secondary sm:text-sm">
              {subtitle}
            </p>
          )}
          <div className={cn("flex flex-col gap-2", subtitle ? "mt-5" : "mt-5")}>
            {children}
          </div>
        </div>

        {footer && <div className="mt-4 text-center">{footer}</div>}
      </div>
    </div>
  );
}

/** Banner shown when Supabase isn't configured. */
export function UnconfiguredNotice() {
  return (
    <div className="rounded-xl border border-warning/30 bg-warning-soft/40 px-4 py-3 text-sm leading-relaxed text-text-secondary">
      Supabase isn't configured yet. Add <code className="font-mono">VITE_SUPABASE_URL</code>{" "}
      and <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to{" "}
      <code className="font-mono">.env</code>, then run the migration in{" "}
      <code className="font-mono">supabase/migrations</code>. Until then, Panda
      runs in anonymous mode.
    </div>
  );
}
