import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { ContentKeyTakeawaysBlock } from "@/content/schema";

/**
 * A polished "key takeaways" checklist that summarises the lesson at a glance.
 * Items reveal with a gentle stagger.
 */
export function KeyTakeawaysBlock({ block }: { block: ContentKeyTakeawaysBlock }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card">
      <div className="border-b border-border-subtle bg-base-subtle/50 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-hover">
          Key takeaways
        </p>
      </div>
      <ul className="flex flex-col divide-y divide-border-subtle/60">
        {block.items.map((item, index) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.25, delay: index * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex items-start gap-3 px-5 py-3.5"
          >
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0 text-accent-hover"
              aria-hidden="true"
            />
            <span className="text-sm leading-relaxed text-text-secondary">{item}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}