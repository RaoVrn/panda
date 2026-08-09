import {
  GitBranch,
  History,
  TrendingUp,
  UserRound,
  type LucideIcon,
} from "lucide-react";

const CONTEXT = [
  {
    icon: UserRound,
    title: "Panda Profile",
    body: "Your name and the account you're learning with.",
  },
  {
    icon: TrendingUp,
    title: "Current Progress",
    body: "Lessons done, XP, level, streak and achievements.",
  },
  {
    icon: History,
    title: "Learning History",
    body: "What you've asked about and struggled with before.",
  },
  {
    icon: GitBranch,
    title: "Git Knowledge",
    body: "The whole course and what each command does.",
  },
] as const;

/**
 * The context Panda AI can draw on when answering. Each item reflects real
 * context the implementation provides.
 */
export function AiContextChips() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {CONTEXT.map((item) => (
        <ContextChip key={item.title} {...item} />
      ))}
    </div>
  );
}

function ContextChip({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-card px-3.5 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-hover">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-text">{title}</span>
        <span className="mt-0.5 block text-[12.5px] leading-relaxed text-text-muted">{body}</span>
      </span>
    </div>
  );
}
