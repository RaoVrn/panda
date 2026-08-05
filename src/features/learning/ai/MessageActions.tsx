import type { StyleAction } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

const ACTIONS: Array<{ action: StyleAction; label: string; emoji: string }> = [
  { action: "simpler", label: "Simpler", emoji: "🎈" },
  { action: "visual", label: "Visual", emoji: "🎨" },
  { action: "example", label: "Example", emoji: "🧪" },
  { action: "challenge", label: "Challenge", emoji: "🎯" },
  { action: "interview", label: "Interview", emoji: "💼" },
  { action: "replay", label: "Explain Again", emoji: "🔁" },
];

/**
 * The small helper actions shown above every Panda AI reply. Each one
 * regenerates the answer for the current question in that style.
 */
export function MessageActions({
  onAction,
  disabled,
}: {
  onAction: (action: StyleAction) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mb-1.5 flex flex-wrap gap-1" role="group" aria-label="Ask in another style">
      {ACTIONS.map(({ action, label, emoji }) => (
        <button
          key={action}
          type="button"
          onClick={() => onAction(action)}
          disabled={disabled}
          title={`Explain this ${label.toLowerCase()}`}
          className={cn(
            "rounded-full border border-border-subtle bg-base-subtle/60 px-2 py-1 text-[10px] font-medium text-text-muted transition-colors",
            "hover:border-accent/40 hover:bg-accent-soft hover:text-text",
            "disabled:pointer-events-none disabled:opacity-40",
          )}
        >
          <span aria-hidden="true" className="mr-1">
            {emoji}
          </span>
          {label}
        </button>
      ))}
    </div>
  );
}
