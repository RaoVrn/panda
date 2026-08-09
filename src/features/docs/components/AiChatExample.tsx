import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { PandaMascot } from "@/components/brand/PandaMascot";
import { useAuth } from "@/features/user/auth/authContext";

/**
 * A small example Panda AI conversation: a user question, Panda's answer, and
 * the contextual action button that takes you straight to the relevant lesson.
 */
export function AiChatExample() {
  const { status } = useAuth();
  const authenticated = status === "authenticated";

  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-card">
      <div className="flex flex-col gap-4 p-5">
        {/* User bubble */}
        <div className="flex flex-row-reverse items-start gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-base-subtle text-text-secondary">
            <span className="text-[11px] font-semibold">You</span>
          </span>
          <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-accent-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-text">
            What exactly happens when I run{" "}
            <code className="font-mono text-[12px] text-accent-hover">git add</code>?
          </p>
        </div>

        {/* Panda bubble */}
        <div className="flex items-start gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft ring-1 ring-inset ring-accent/20">
            <PandaMascot state="success" size={32} />
          </span>
          <div className="max-w-[85%]">
            <p className="rounded-2xl rounded-tl-sm bg-base-subtle/60 px-3.5 py-2.5 text-[13px] leading-relaxed text-text-secondary">
              <code className="font-mono text-[12px] text-accent-hover">git add</code> moves
              your selected changes into the staging area so they can be included in the next
              commit.
            </p>
            {authenticated ? (
              <Link
                to="/lesson/git-add"
                className="mt-2 inline-flex items-center gap-1 rounded-lg border border-accent/30 bg-accent-soft/50 px-2.5 py-1 text-[12px] font-medium text-accent-hover transition-colors hover:bg-accent-soft"
              >
                Open Git Add lesson
                <ArrowUpRight className="size-3" aria-hidden="true" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="mt-2 inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-base-subtle px-2.5 py-1 text-[12px] font-medium text-text-muted transition-colors hover:text-text"
              >
                Open Git Add lesson · sign in
                <ArrowUpRight className="size-3" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
