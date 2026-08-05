import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const COLORS = ["#2bb09b", "#3cc2ad", "#f5a524", "#f04438", "#a5d6ff"];

/**
 * A tiny, subtle confetti burst that plays once. Meant to celebrate a
 * completed quiz or lesson without being flashy. Renders nothing for users
 * who prefer reduced motion.
 */
export function Confetti({ count = 18 }: { count?: number }) {
  const reduceMotion = useReducedMotion();

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 240,
        y: 50 + Math.random() * 130,
        rotate: (Math.random() - 0.5) * 400,
        color: COLORS[i % COLORS.length]!,
        scale: 0.6 + Math.random() * 0.6,
        delay: Math.random() * 0.18,
      })),
    [count],
  );

  if (reduceMotion) return null;

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-2 flex justify-center overflow-visible"
    >
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          className="absolute top-0 size-1.5 rounded-[2px]"
          style={{ backgroundColor: piece.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: piece.scale, rotate: 0 }}
          animate={{ x: piece.x, y: piece.y, opacity: 0, rotate: piece.rotate }}
          transition={{ duration: 0.9, delay: piece.delay, ease: [0.2, 0.8, 0.2, 1] }}
        />
      ))}
    </span>
  );
}
