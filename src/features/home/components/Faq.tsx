import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Do I need Git installed?",
    a: "No. Panda runs Git in your browser, so there's nothing to install. You can learn everything here first, then install Git when you're ready to use it on your own projects.",
  },
  {
    q: "Is this beginner friendly?",
    a: "Very. Panda starts from zero, explaining what Git is and why it exists, using simple English, real-life analogies and hands-on practice. No prior experience needed.",
  },
  {
    q: "Can I skip lessons?",
    a: "Yes. Every lesson is available to you. We gently recommend finishing earlier modules first, but you're never locked out.",
  },
  {
    q: "Do I learn GitHub too?",
    a: "You do. The course covers the full workflow: local commits, branches, merges, and then remotes with cloning, fetching, pulling and pushing, so GitHub and similar services make sense.",
  },
  {
    q: "Can I practice safely?",
    a: "Every playground is a simulated repository in your browser. Break it as much as you like. You can reset it in one click, and nothing real is ever at risk.",
  },
  {
    q: "Does Panda work on mobile?",
    a: "Yes. The lessons and playground adapt to any screen, so you can read on your phone and practice on a bigger screen whenever you want.",
  },
  {
    q: "How long does it take?",
    a: "Most people finish the core modules in a few focused sessions. Go at your own pace. You can pause and pick up exactly where you left off.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-16 sm:py-20">
      <SectionTitle
        eyebrow="Questions"
        title="Everything you might be wondering"
      />
      <div className="mx-auto mt-10 max-w-2xl space-y-2.5">
        {faqs.map((faq, index) => {
          const expanded = open === index;
          return (
            <div
              key={faq.q}
              className={cn(
                "overflow-hidden rounded-xl border transition-colors duration-200",
                expanded ? "border-accent/25 bg-accent/[0.03]" : "border-border-subtle bg-white/[0.01]",
              )}
            >
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : index)}
                aria-expanded={expanded}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
              >
                <span className="min-w-0 flex-1 text-sm font-medium text-text">{faq.q}</span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-text-muted transition-transform duration-200",
                    expanded && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <p className="border-t border-white/[0.04] px-4 py-3 text-sm leading-relaxed text-text-secondary">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
