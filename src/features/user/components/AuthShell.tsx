import type { ReactNode } from "react";
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

/** Premium centered auth card used by sign in / sign up / reset. */
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
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-7 flex flex-col items-center gap-2 text-center">
          <span
            className="flex size-14 items-center justify-center rounded-2xl bg-accent-soft"
            aria-hidden="true"
          >
            <Logo size={36} />
          </span>
          <p className="mt-1 text-xl font-semibold tracking-tight text-text">Panda</p>
          <p className="text-sm text-text-muted">Your Git mentor</p>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-card p-8 shadow-card">
          <h1 className="text-xl font-semibold tracking-tight text-text">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{subtitle}</p>
          )}
          <div className={cn("flex flex-col", subtitle ? "mt-6" : "mt-6")}>{children}</div>
        </div>

        {footer && <div className="mt-6 text-center">{footer}</div>}
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
