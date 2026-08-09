import { cn } from "@/lib/utils";

/**
 * Panda switch. A compact, accessible on/off control used everywhere:
 * - OFF: neutral track, white thumb on the left
 * - ON:  teal track, white thumb on the right
 * Keyboard + mouse friendly, focusable, with a smooth ~200ms transition.
 */
export function Switch({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        checked ? "bg-accent" : "border border-border-subtle bg-base-subtle",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-0.5 top-1/2 size-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}
