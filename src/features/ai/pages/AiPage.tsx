import { AiPanel } from "@/features/learning/layout/AiPanel";

/**
 * Full-page Panda AI chat. Reuses the same panel the lesson workspace shows,
 * so the experience is identical whether opened from the landing page or a
 * lesson. No lesson context is injected here, but history is preserved for
 * the session.
 */
export function AiPage() {
  return (
    <div className="flex h-[calc(100dvh-4rem)] items-stretch justify-center py-6">
      <div className="flex w-full max-w-3xl overflow-hidden rounded-2xl border border-border-subtle shadow-card">
        <AiPanel />
      </div>
    </div>
  );
}
