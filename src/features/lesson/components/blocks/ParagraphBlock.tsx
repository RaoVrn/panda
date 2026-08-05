import { motion } from "framer-motion";
import type { ContentParagraphBlock } from "@/content/schema";
import { InlineText } from "@/features/lesson/components/InlineText";

export function ParagraphBlock({ block }: { block: ContentParagraphBlock }) {
  return (
    <motion.p
      initial={{ opacity: 1, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
      className="whitespace-pre-wrap text-base leading-relaxed text-text-secondary"
    >
      <InlineText text={block.text} />
    </motion.p>
  );
}