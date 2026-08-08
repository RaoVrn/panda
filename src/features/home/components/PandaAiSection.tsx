import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Lightbulb,
  MessageSquareText,
  Puzzle,
  Search,
  Sparkles,
} from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";

const capabilities = [
  { icon: <BookOpen className="size-3.5" aria-hidden="true" />, label: "Explain this lesson" },
  { icon: <Sparkles className="size-3.5" aria-hidden="true" />, label: "Explain like I'm ten" },
  { icon: <Lightbulb className="size-3.5" aria-hidden="true" />, label: "Give me an analogy" },
  { icon: <Puzzle className="size-3.5" aria-hidden="true" />, label: "Quiz me" },
  { icon: <Search className="size-3.5" aria-hidden="true" />, label: "Find my mistake" },
  { icon: <MessageSquareText className="size-3.5" aria-hidden="true" />, label: "Suggest next topic" },
];

function AiChatMock() {
  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-white/[0.03] bg-white/[0.01] px-3 py-2">
        <span className="flex size-5 items-center justify-center rounded-lg bg-accent/8 text-accent-hover">
          <Sparkles className="size-3" aria-hidden="true" />
        </span>
        <span className="text-[11px] font-medium text-text">Panda AI</span>
        <span className="ml-auto rounded-full bg-base-subtle px-2 py-0.5 text-[9px] font-medium text-text-muted">
          git add · Playground
        </span>
      </div>
      <div className="space-y-3 p-3">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-accent px-3 py-2 text-[12px] leading-relaxed text-text-inverse"
        >
          Why isn't this working? I ran git commit but nothing happened.
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="max-w-[92%] rounded-2xl rounded-tl-sm border border-white/[0.04] bg-base-subtle/40 px-3 py-2 text-[12px] leading-relaxed text-text-secondary"
        >
          <p className="font-medium text-text">Good catch. You're on the right track.</p>
          <p className="mt-1">
            git commit only saves files that are <strong className="text-text">staged</strong>.
            Your README.md is still in the working tree, so Git has nothing to commit yet.
          </p>
          <p className="mt-1.5 font-mono text-[11px] text-[#79c0ff]">git add README.md</p>
          <p className="mt-1.5 border-t border-white/[0.06] pt-1.5 font-mono text-[10px] text-text-muted">
            Working Tree → git add → Staging Area → git commit
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export function PandaAiSection() {
  return (
    <section className="py-16 sm:py-20">
      <SectionTitle
        eyebrow="Panda AI"
        title="A mentor, not a chatbot."
        description="Panda knows your lesson, your repository and your mission. Ask for a hint and you get a hint, never the answer on the first try."
      />
      <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <AiChatMock />
        </motion.div>

        <div>
          <p className="text-lg leading-relaxed text-text-secondary">
            Stuck on step two of a mission? Panda already knows which branch
            you're on, what you've staged, and where your last command went
            wrong.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-text-secondary">
            It explains in simple English, with analogies and working examples,
            and it never dumps the answer before you've had a chance to think.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {capabilities.map((cap) => (
              <span
                key={cap.label}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-white/[0.02] px-2.5 py-1.5 text-[12px] text-text-secondary transition-colors hover:border-accent/30 hover:text-text"
              >
                <span className="text-accent-hover">{cap.icon}</span>
                {cap.label}
              </span>
            ))}
          </div>
          <Button href="/ai" variant="secondary" className="mt-8" rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}>
            Meet Panda AI
          </Button>
        </div>
      </div>
    </section>
  );
}
