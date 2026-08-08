import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { playAchievementSound } from "@/lib/audio/achievementSound";
import { useAchievementCelebration } from "./achievementCelebrationStore";
import type { AchievementDefinition } from "../achievements";

/**
 * Polished, once-only achievement celebration. Mounted at the app root (and
 * portaled to <body>), it shows a calm centered modal whenever the progress
 * store reports a genuinely new unlock — with a soft chime. It never fires on
 * page load for achievements the learner already had.
 */
export function AchievementCelebration() {
  const queue = useAchievementCelebration((s) => s.queue);
  const shift = useAchievementCelebration((s) => s.shift);
  const [shown, setShown] = useState<AchievementDefinition | null>(null);

  useEffect(() => {
    const first = queue[0];
    if (!shown && first) {
      setShown(first);
      playAchievementSound();
    }
  }, [queue, shown]);

  const dismiss = () => {
    setShown(null);
    shift();
  };

  return (
    <Modal
      open={Boolean(shown)}
      onClose={dismiss}
      labelledBy="celebration-title"
      className="max-w-sm"
    >
      {shown && (
        <div className="text-center">
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-accent-soft text-accent-hover"
            aria-hidden="true"
          >
            <shown.icon className="size-8" />
          </motion.span>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-accent-hover"
          >
            Achievement unlocked
          </motion.p>
          <h2
            id="celebration-title"
            className="mt-1 text-xl font-semibold tracking-tight text-text"
          >
            {shown.title}
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.16 }}
            className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-text-secondary"
          >
            {shown.description}
          </motion.p>

          <Button variant="secondary" onClick={dismiss} className="mt-6 w-full">
            Nice
          </Button>
        </div>
      )}
    </Modal>
  );
}
