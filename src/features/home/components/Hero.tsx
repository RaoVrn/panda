import { motion } from "framer-motion";
import { ArrowRight, Map } from "lucide-react";
import { Button } from "@/components/ui/Button";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] },
  },
};

function scrollToRoadmap() {
  document
    .getElementById("roadmap")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Hero() {
  return (
    <section className="flex flex-col items-center py-20 text-center sm:py-28">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center"
      >
        <motion.div
          variants={item}
          className="flex size-20 items-center justify-center rounded-3xl border border-border-subtle bg-card shadow-card"
        >
          <motion.span
            className="text-4xl"
            aria-hidden="true"
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 16,
              delay: 0.3,
            }}
          >
            🐼
          </motion.span>
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-8 max-w-4xl text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl"
        >
          Learn Git{" "}
          <span className="text-accent-hover">Visually.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-text-secondary"
        >
          Master Git, GitHub and Version Control through visual explanations,
          interactive editors, terminal simulations, branch visualizers and
          AI-powered guidance.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            href="/course"
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
        </motion.div>
      </motion.div>
    </section>
  );
}