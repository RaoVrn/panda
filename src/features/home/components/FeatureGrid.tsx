import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  Command,
  FolderTree,
  GitBranch,
  Lightbulb,
  MonitorPlay,
  MonitorSmartphone,
  Moon,
  Puzzle,
  Search,
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
    icon: Boxes,
    title: "Visual Repository",
    description: "Watch your working tree, staging area and history live, side by side.",
  },
  {
    icon: Terminal,
    title: "Interactive Terminal",
    description: "Type real Git commands and get real responses. Nothing faked.",
  },
  {
    icon: GitBranch,
    title: "Branch Graph",
    description: "See branches split and merge in real time as you work.",
  },
  {
    icon: FolderTree,
    title: "Repository Explorer",
    description: "Inspect files, statuses, commits and HEAD at a glance.",
  },
  {
    icon: Lightbulb,
    title: "AI Mentor",
    description: "Get hints, analogies and explanations without spoilers.",
  },
  {
    icon: Puzzle,
    title: "Mission System",
    description: "Every lesson ends in a hands-on mission with clear goals.",
  },
  {
    icon: MonitorPlay,
    title: "Safe Sandbox",
    description: "Break repositories on purpose. Reset is one click away.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "XP, streaks and lessons completed keep you motivated.",
  },
  {
    icon: Search,
    title: "Instant Search",
    description: "Find any lesson, command or concept in seconds with ⌘K.",
  },
  {
    icon: Moon,
    title: "Dark & Light Mode",
    description: "A comfortable theme for late-night and daytime learning.",
  },
  {
    icon: Command,
    title: "Keyboard Shortcuts",
    description: "Move between lessons and search without touching the mouse.",
  },
  {
    icon: MonitorSmartphone,
    title: "Works Everywhere",
    description: "A responsive layout for desktop, tablet and phone.",
  },
];

export function FeatureGrid() {
  return (
    <section className="py-16 sm:py-20">
      <SectionTitle
        eyebrow="Capabilities"
        title="A complete learning environment"
        description="Everything is designed around one idea: if you can see it, you can understand it."
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
              <h3 className="mt-4 text-sm font-semibold text-text">{feature.title}</h3>
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
