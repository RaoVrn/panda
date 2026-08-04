import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Brain,
  GitBranch,
  MonitorPlay,
  FolderTree,
  Puzzle,
  Terminal,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: BookOpen,
    title: "Beginner Friendly",
    description: "Every concept explained simply, with zero jargon.",
  },
  {
    icon: GitBranch,
    title: "Branch Visualizer",
    description: "See your branches grow in real time as you learn.",
  },
  {
    icon: Terminal,
    title: "Interactive Terminal",
    description: "Type real Git commands in a safe, simulated shell.",
  },
  {
    icon: FolderTree,
    title: "Directory Explorer",
    description: "Understand how files and folders really change.",
  },
  {
    icon: MonitorPlay,
    title: "Animated Lessons",
    description: "Watch concepts unfold step by step, visually.",
  },
  {
    icon: Brain,
    title: "Panda AI Teacher",
    description: "Stuck? Panda explains it in your own words.",
  },
  {
    icon: Puzzle,
    title: "Practice Challenges",
    description: "Apply what you learned with hands-on exercises.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Watch yourself grow from beginner to confident.",
  },
];

export function FeatureGrid() {
  return (
    <section className="py-16 sm:py-20">
      <SectionTitle
        eyebrow="Capabilities"
        title="Everything you need to master Git"
        description="A complete learning environment designed around one idea: if you can see it, you can understand it."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.4,
              delay: (index % 4) * 0.05,
              ease: [0.2, 0.8, 0.2, 1],
            }}
          >
            <Card className="group h-full p-5 transition-[color,background-color,border-color,transform] duration-200 hover:-translate-y-1 hover:border-border hover:bg-card-hover">
              <div className="flex size-10 items-center justify-center rounded-xl bg-base-subtle transition-colors group-hover:bg-accent-soft">
                <feature.icon className="size-5 text-text-secondary transition-colors group-hover:text-accent-hover" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-text">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                {feature.description}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}