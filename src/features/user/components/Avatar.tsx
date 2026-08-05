import { cn } from "@/lib/utils";
import type { UserProfile } from "@/features/user/types";
import { AVATAR_OPTIONS } from "@/features/user/components/avatarOptions";
import { PANDA_LOGO } from "@/components/brand/pandaLogo";

const DEFAULT_AVATAR = PANDA_LOGO;

export function Avatar({
  profile,
  size = 40,
  className,
}: {
  profile?: Pick<UserProfile, "avatarUrl"> | null;
  size?: number;
  className?: string;
}) {
  const emoji = profile?.avatarUrl || DEFAULT_AVATAR;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-full bg-accent-soft ring-1 ring-inset ring-accent/20",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.5) }}
    >
      {emoji}
    </span>
  );
}

export function AvatarPicker({
  value,
  onSelect,
}: {
  value?: string;
  onSelect: (emoji: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {AVATAR_OPTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          aria-pressed={value === emoji}
          aria-label={`Avatar ${emoji}`}
          className={cn(
            "flex size-10 items-center justify-center rounded-full text-xl transition-all",
            value === emoji
              ? "bg-accent-soft ring-2 ring-accent"
              : "bg-base-subtle hover:bg-base-elevated",
          )}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
