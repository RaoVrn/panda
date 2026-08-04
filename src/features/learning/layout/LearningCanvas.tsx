import type { ReactNode } from "react";

export function LearningCanvas({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8">
      {children}
    </main>
  );
}