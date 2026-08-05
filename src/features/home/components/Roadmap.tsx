import { Clock, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

type Difficulty = "beginner" | "intermediate" | "advanced";
type Status = "available" | "locked";

interface RoadmapModule {
  title: string;
  difficulty: Difficulty;
  duration: number;
  status: Status;
}

const difficultyTone: Record<Difficulty, BadgeTone> = {
  beginner: "success",
  intermediate: "warning",
  advanced: "danger",
};

const modules: RoadmapModule[] = [
  { title: "Introduction", difficulty: "beginner", duration: 5, status: "available" },
  { title: "Version Control", difficulty: "beginner", duration: 10, status: "available" },
  { title: "Git Basics", difficulty: "beginner", duration: 15, status: "available" },
  { title: "Commits", difficulty: "beginner", duration: 20, status: "available" },
  { title: "Branches", difficulty: "beginner", duration: 20, status: "available" },
  { title: "Merge", difficulty: "intermediate", duration: 20, status: "available" },
  { title: "Rebase", difficulty: "intermediate", duration: 20, status: "available" },
  { title: "Remote", difficulty: "intermediate", duration: 20, status: "available" },
  { title: "GitHub", difficulty: "intermediate", duration: 30, status: "available" },
  { title: "Pull Requests", difficulty: "intermediate", duration: 25, status: "available" },
  { title: "Advanced Git", difficulty: "advanced", duration: 40, status: "available" },
  { title: "CI/CD", difficulty: "advanced", duration: 30, status: "available" },
];

function ModuleCard({ module, index }: { module: RoadmapModule; index: number }) {
  const locked = module.status === "locked";
  const inner = (
    <Card
      interactive={!locked}
      className={
        locked
          ? "h-full p-5 opacity-60"
          : "h-full p-5 transition-[color,background-color,border-color,transform] duration-200 hover:-translate-y-1"
      }
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-text-muted">
          {String(index + 1).padStart(2, "0")}
        </span>
        {locked ? (
          <Lock className="size-4 text-text-muted" aria-label="Locked" />
        ) : (
          <Badge tone="success">Available</Badge>
        )}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-text">{module.title}</h3>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge tone={difficultyTone[module.difficulty]}>
          {module.difficulty}
        </Badge>
        <span className="flex items-center gap-1 text-xs text-text-muted">
          <Clock className="size-3" />
          {module.duration} min
        </span>
      </div>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {locked ? (
        inner
      ) : (
        <Link
          to="/course"
          className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label={`Open ${module.title} in the course`}
        >
          {inner}
        </Link>
      )}
    </motion.div>
  );
}

export function Roadmap() {
  return (
    <section id="roadmap" className="scroll-mt-16 py-16">
      <SectionTitle
        eyebrow="Course roadmap"
        title="A complete path from zero to hero"
        description="12 focused modules. Learn at your own pace, in any order you like."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((module, index) => (
          <ModuleCard key={module.title} module={module} index={index} />
        ))}
      </div>
    </section>
  );
}