import { motion } from "framer-motion";
import { BookOpen, Lock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { modules } from "@/content/curriculum";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { cn } from "@/lib/utils";

/**
 * The course as a journey, not a list of cards. Uses the REAL curriculum
 * modules (with their authored lesson counts), connected by a glowing line.
 * The first module is your starting point; hovering a stop lights up the path.
 */
export function Roadmap() {
  return (
    <section id="roadmap" className="scroll-mt-16 py-16 sm:py-20">
      <SectionTitle
        eyebrow="Course roadmap"
        title="A path, not a pile of lessons"
        description={`${modules.length} connected modules, ${modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons that build on each other, from your very first commit to advanced Git.`}
      />
      <div className="mx-auto mt-14 max-w-2xl">
        <ol className="relative">
          {/* The path line */}
          <div
            aria-hidden="true"
            className="absolute left-[19px] top-2 bottom-2 w-px bg-border-subtle"
          />
          {modules.map((module, index) => {
            const isFirst = index === 0;
            const lessonCount = module.lessons.length;
            return (
              <li key={module.id} className="group relative pb-9 last:pb-0">
                <Link
                  to="/dashboard"
                  className="flex items-start gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  aria-label={`Open ${module.title} in the course`}
                >
                  {/* Node */}
                  <span
                    className={cn(
                      "relative z-10 mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border bg-card transition-all duration-200 group-hover:scale-110",
                      isFirst
                        ? "border-accent/50 bg-accent-soft text-accent-hover shadow-glow"
                        : "border-border-subtle text-text-muted group-hover:border-accent/40 group-hover:text-accent-hover",
                    )}
                  >
                    {isFirst ? (
                      <Sparkles className="size-4" aria-hidden="true" />
                    ) : (
                      <Lock className="size-4 opacity-70" aria-hidden="true" />
                    )}
                  </span>

                  {/* Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.35, delay: index * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
                    className={cn(
                      "min-w-0 flex-1 rounded-xl border p-4 transition-colors duration-200",
                      isFirst
                        ? "border-accent/25 bg-accent/[0.04]"
                        : "border-border-subtle bg-white/[0.01] group-hover:border-accent/20 group-hover:bg-white/[0.02]",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-text-muted">
                        {String(module.order).padStart(2, "0")}
                      </span>
                      <h3 className="truncate text-sm font-semibold text-text">{module.title}</h3>
                      {isFirst && (
                        <span className="ml-auto shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent-hover">
                          Start here
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-text-secondary">
                      {module.description}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-text-muted">
                      <BookOpen className="size-3" aria-hidden="true" />
                      {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
                    </p>
                  </motion.div>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
