import { cn } from "@/lib/utils";

const AUTH_INPUT =
  "h-11 w-full rounded-lg border bg-base-subtle pl-10 pr-3.5 text-sm text-text placeholder:text-text-muted transition-all focus:outline-none focus:ring-2";

/** Input class for auth fields, with an optional error state. */
export function authInputClass(error?: boolean): string {
  return cn(
    AUTH_INPUT,
    error
      ? "border-danger/50 focus:border-danger/60 focus:ring-danger/15"
      : "border-border-subtle focus:border-border-strong focus:ring-accent/20",
  );
}
