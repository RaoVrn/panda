import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { scaledDuration, useAnimationSpeed } from "@/lib/motion/animation";

/**
 * Route transition. Content is fully visible from the very first frame  - 
 * no fade-from-black, no invisible start. Only a tiny 150ms settle (4px) so
 * navigation feels polished without ever delaying readability. The app shell
 * (header, sidebar, menu) stays mounted; only the page content swaps.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const factor = useAnimationSpeed();
  return (
    <motion.div
      key={location.pathname}
      initial={{ y: 6 }}
      animate={{ y: 0 }}
      transition={{ duration: scaledDuration(150, factor), ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
