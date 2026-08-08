import { motion } from "framer-motion";
import { ArrowRight, Map } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";

function scrollToRoadmap() {
  document
    .getElementById("roadmap")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function FinalCta() {
  return (
    <section className="py-16 sm:py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="flex flex-col items-center rounded-3xl border border-border-subtle bg-card px-6 py-16 text-center shadow-card"
      >
        <Logo size={48} className="mx-auto" />
        <h2 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Stop memorizing Git.{" "}
          <span className="text-accent-hover">Start understanding it.</span>
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-text-secondary">
          Watch every command come to life, practice safely in a real
          repository, and get a mentor who explains things the way you think.
          Your first lesson takes five minutes.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            size="lg"
            href="/dashboard"
            rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
          >
            Start Learning
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={scrollToRoadmap}
            leftIcon={<Map className="size-4" aria-hidden="true" />}
          >
            Explore Roadmap
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
