import { AiPanel } from "@/features/learning/layout/AiPanel";
import { PageHeader } from "@/components/layout/PageHeader";

/**
 * Full-page Panda AI chat. Reuses the same panel the lesson workspace shows,
 * so the experience is identical whether opened from the header or a lesson.
 */
export function AiPage() {
  return (
    <div className="mx-auto w-full max-w-3xl py-8">
      <PageHeader
        title="Panda AI"
        subtitle="Ask anything about your lessons — Panda knows what you're reading."
        back={{ to: "/course", label: "Dashboard" }}
      />
      <div className="h-[72vh] overflow-hidden rounded-2xl border border-border-subtle shadow-card">
        <AiPanel />
      </div>
    </div>
  );
}
