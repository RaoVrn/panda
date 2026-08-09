import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";

/**
 * A quiet landing-page section pointing new visitors to the documentation.
 * Deliberately secondary to "Start Learning"  -  one line, one link.
 */
export function DocsCta() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
        New to Panda?
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-text sm:text-2xl">
        Not sure where to begin?
      </h2>      <p className="mx-auto mt-2 max-w-xl text-[15px] leading-relaxed text-text-secondary">
        A quick, visual guide to how Panda works, how lessons and the playground
        work, and how Panda AI helps.
      </p>
      <Link
        to="/docs"
        className="group mt-5 inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-base-subtle px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text"
      >
        <BookOpen className="size-4 text-accent-hover" aria-hidden="true" />
        How Panda Works
        <ArrowRight
          className="size-3.5 text-text-muted transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </section>
  );
}
