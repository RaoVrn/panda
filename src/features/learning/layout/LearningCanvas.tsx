import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface LearningCanvasProps {
  children: ReactNode;
  /** Wider measure for the interactive playground workspace. */
  wide?: boolean;
}

export function LearningCanvas({ children, wide = false }: LearningCanvasProps) {
  return (
    <main
      className={cn(
        "mx-auto w-full flex-1 px-5 py-10 sm:px-8 lg:px-12 lg:py-12",
        wide ? "max-w-[96rem]" : "max-w-[60rem]",
      )}
    >
      {children}
    </main>
  );
}
