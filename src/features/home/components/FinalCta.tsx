import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
        <span className="text-4xl" aria-hidden="true">
          🐼
        </span>
        <h2 className="mt-6 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to see Git for the first time?
        </h2>
        <p className="mt-4 max-w-lg text-text-secondary">
          Join Panda and go from "what is a commit?" to confidently shipping
          code with branches, merges and pull requests.
        </p>
        <Button
          size="lg"
          className="mt-8"
          rightIcon={<ArrowRight className="size-4" />}
        >
          Start Learning
        </Button>
      </motion.div>
    </section>
  );
}