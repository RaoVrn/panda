import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

/**
 * A clickable example prompt for Panda AI. Clicking it navigates to Panda AI
 * with the prompt carried in router state, so the conversation opens and the
 * question is submitted automatically through the normal chat pipeline.
 */
export function PromptCard({ prompt }: { prompt: string }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/panda-ai", { state: { initialPrompt: prompt } })}
      className="group flex w-full items-center gap-2.5 rounded-xl border border-border-subtle bg-card px-4 py-3 text-left transition-colors hover:border-accent/40 hover:bg-card-hover"
    >
      <Sparkles className="size-3.5 shrink-0 text-accent-hover" aria-hidden="true" />
      <span className="font-mono text-[13px] text-text-secondary transition-colors group-hover:text-text">
        “{prompt}”
      </span>
    </button>
  );
}
