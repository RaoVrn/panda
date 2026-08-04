import { ArrowUpRight, Github } from "lucide-react";
import { Divider } from "@/components/ui/Divider";

export function Footer() {
  return (
    <footer className="pt-14">
      <Divider />
      <div className="flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span aria-hidden="true">🐼</span>
          <span className="font-medium text-text">Panda</span>
          <span className="text-text-muted">·</span>
          <span>One bamboo at a time.</span>
        </div>
        <a
          href="https://github.com/RaoVrn"
          target="_blank"
          rel="noreferrer noopener"
          className="group inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
        >
          <Github className="size-4" aria-hidden="true" />
          RaoVrn
          <ArrowUpRight
            className="size-3.5 text-text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </a>
      </div>
    </footer>
  );
}