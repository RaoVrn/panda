import { cn } from "@/lib/utils";
import { PANDA_LOGO } from "@/components/brand/pandaLogo";

/**
 * The one Panda logo used everywhere: navbar, sidebar, auth, profile, AI panel
 * and the loading screen. Icon-only. Pair with <Brand /> for the wordmark.
 */
export function Logo({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex select-none items-center justify-center leading-none",
        className,
      )}
      style={{ width: size, height: size, fontSize: size }}
    >
      {PANDA_LOGO}
    </span>
  );
}

/** Logo + "Panda" wordmark. App title is always semibold. */
export function Brand({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Logo size={size} />
      <span className="font-semibold tracking-tight text-text">Panda</span>
    </span>
  );
}
