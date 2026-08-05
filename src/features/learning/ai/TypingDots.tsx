import { motion } from "framer-motion";

/** Three bouncing dots shown while Panda AI is thinking. */
export function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1" aria-label="Panda AI is typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-accent"
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}
