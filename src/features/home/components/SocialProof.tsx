import { motion } from "framer-motion";
import { allLessons } from "@/content/lessons";
import { modules } from "@/content/curriculum";

const lessonCount = allLessons().length;
const playgroundCount = allLessons().filter((l) => l.playground).length;

export function SocialProof() {
  const stats = [
    { value: String(lessonCount), label: "lessons" },
    { value: String(modules.length), label: "modules" },
    { value: String(playgroundCount), label: "hands-on playgrounds" },
    { value: "Every", label: "lesson with an AI mentor" },
  ];

  return (
    <section className="py-12 sm:py-16" aria-label="What's inside Panda">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: index * 0.07, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex flex-col items-center rounded-2xl border border-border-subtle bg-card px-4 py-6 text-center"
          >
            <span className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              {stat.value}
            </span>
            <span className="mt-1.5 text-sm text-text-secondary">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
