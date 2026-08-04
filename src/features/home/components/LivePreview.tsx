import { motion } from "framer-motion";
import { GitBranch, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { FakeEditor } from "@/features/home/components/FakeEditor";
import { GitCommitGraph } from "@/features/home/components/GitCommitGraph";

const commandLines = [
  { content: "git init", highlight: true },
  { content: "git add .", highlight: true },
  { content: 'git commit -m "first commit"', highlight: true },
  { content: "git branch feature", highlight: true },
  { content: "git checkout feature", highlight: true },
];

export function LivePreview() {
  return (
    <section className="py-16">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <Badge tone="accent">Live Preview</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            What is Git?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-text-secondary">
            Git is a <strong className="font-medium text-text">time machine</strong>{" "}
            for your code. It remembers every change you make, so you can
            experiment freely and never lose work again.
          </p>
          <p className="mt-4 text-base leading-relaxed text-text-secondary">
            Watch as a repository comes alive — every command you type is
            reflected instantly in the branch graph below.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1], delay: 0.1 }}
        >
          <FakeEditor
            title="panda-repo"
            tabs={[
              { name: "README.md", icon: "M" },
              { name: "index.html", icon: "H" },
              { name: "git-commands.sh", icon: "S", active: true },
            ]}
            lines={commandLines}
          />

          <div className="mt-4 flex items-center gap-4 rounded-2xl border border-border-subtle bg-card p-4 shadow-card">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
              <GitBranch className="size-4 text-accent-hover" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">Branch graph</p>
              <p className="flex items-center gap-1.5 text-xs text-text-muted">
                <Terminal className="size-3" aria-hidden="true" />
                main + feature · 4 commits
              </p>
            </div>
            <GitCommitGraph className="ml-auto hidden max-w-[180px] sm:block" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}