import { motion } from "framer-motion";
import type { ContentImageBlock } from "@/content/schema";

export function ImageBlock({ block }: { block: ContentImageBlock }) {
  return (
    <motion.figure
      initial={{ opacity: 1, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className="overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card"
    >
      <img
        src={block.src}
        alt={block.alt}
        loading="lazy"
        className="mx-auto max-h-[360px] w-full object-contain p-4 transition-transform duration-500 hover:scale-[1.015]"
      />
      {block.caption && (
        <figcaption className="border-t border-border-subtle px-5 py-3 text-center text-xs text-text-muted">
          {block.caption}
        </figcaption>
      )}
    </motion.figure>
  );
}