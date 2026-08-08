import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Boxes,
  MessageSquareText,
  Rocket,
  X,
} from "lucide-react";
import { allLessons } from "@/content/lessons";
import { useAuth } from "@/features/user/auth/authContext";
import { useOnboardingStore } from "../onboardingStore";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  icon: React.ReactNode;
  title: string;
  /** A short body. Keep to 2–3 short lines — one idea per screen. */
  body: string;
  /** A one-line friendly kicker shown above the title. */
  kicker: string;
}

const STEPS: Step[] = [
  {
    id: "welcome",
    icon: <Boxes className="size-6" aria-hidden="true" />,
    title: "Welcome to Panda",
    kicker: "Let's learn Git the fun way",
    body: "Panda teaches Git by letting you use Git, not just read about it.",
  },
  {
    id: "read",
    icon: <BookOpen className="size-6" aria-hidden="true" />,
    title: "Learn one idea at a time",
    kicker: "Read mode",
    body: "Short lessons in simple English, with real examples you'll actually use.",
  },
  {
    id: "playground",
    icon: <Boxes className="size-6" aria-hidden="true" />,
    title: "Practice immediately",
    kicker: "The Playground",
    body: "Every lesson becomes hands-on. You'll learn by doing and break things safely.",
  },
  {
    id: "ai",
    icon: <MessageSquareText className="size-6" aria-hidden="true" />,
    title: "Your personal Git mentor",
    kicker: "Panda AI",
    body: "Ask questions anytime. Get hints without spoilers, whenever you're stuck.",
  },
  {
    id: "start",
    icon: <Rocket className="size-6" aria-hidden="true" />,
    title: "Ready to start?",
    kicker: "You don't need any experience",
    body: "Let's make your first commit together. You'll be amazed how quickly it clicks.",
  },
];

/** First authored lesson in course order — where "Start learning" lands. */
function firstLessonSlug(): string {
  return allLessons()[0]?.slug ?? "";
}

/**
 * First-visit welcome overlay. Shows once (until the learner completes or
 * skips), then never again. Small, friendly, one idea per screen, with subtle
 * fade/slide transitions and keyboard + screen-reader support.
 */
export function OnboardingOverlay() {
  const { status } = useAuth();
  const completed = useOnboardingStore((s) => s.completed);
  const markComplete = useOnboardingStore((s) => s.complete);

  const [step, setStep] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const show =
    status !== "loading" &&
    !completed &&
    (status === "authenticated" || status === "unconfigured");

  const finish = useCallback(() => {
    markComplete();
  }, [markComplete]);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  const next = useCallback(() => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else finish();
  }, [step, finish]);

  const back = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  const startLearning = useCallback(() => {
    finish();
    // The overlay lives outside the router, so navigate via a full page load.
    const slug = firstLessonSlug();
    window.location.assign(slug ? `/lesson/${slug}` : "/dashboard");
  }, [finish]);

  // Lock body scroll + trap focus while shown.
  useEffect(() => {
    if (!show) return;
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      lastFocusedRef.current?.focus();
    };
  }, [show]);

  // Keyboard: Esc skips, arrow keys navigate.
  useEffect(() => {
    if (!show) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") skip();
      else if (event.key === "ArrowRight") next();
      else if (event.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, skip, next, back]);

  if (!show) return null;

  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-base/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-body"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-lg rounded-3xl border border-border-subtle bg-card p-6 shadow-2xl outline-none sm:p-8"
      >
        {/* Header: brand + skip */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Logo size={22} />
            <span className="text-sm font-semibold text-text">Panda</span>
          </span>
          <button
            type="button"
            onClick={skip}
            className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-text-muted transition-colors hover:bg-base-subtle hover:text-text focus-visible:outline-2 focus-visible:outline-accent"
            aria-label="Skip onboarding"
          >
            Skip
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Step content */}
        <div className="relative min-h-[220px] sm:min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex flex-col items-center text-center"
            >
              <span className="flex size-16 items-center justify-center rounded-2xl bg-accent-soft text-accent-hover shadow-[0_0_0_1px_rgba(52,179,160,0.12)]">
                {current.icon}
              </span>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-widest text-accent-hover">
                {current.kicker}
              </p>
              <h2 id="onboarding-title" className="mt-1.5 text-2xl font-semibold tracking-tight text-text">
                {current.title}
              </h2>
              <p id="onboarding-body" className="mt-2 max-w-sm text-[15px] leading-relaxed text-text-secondary">
                {current.body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="mt-6 flex items-center justify-center gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(i)}
              aria-label={`Go to step ${i + 1}: ${s.title}`}
              aria-current={i === step ? "step" : undefined}
              className={cn(
                "h-2 rounded-full transition-all duration-200",
                i === step ? "w-6 bg-accent" : "w-2 bg-border-strong hover:bg-text-muted",
              )}
            />
          ))}
        </div>

        {/* Footer controls */}
        <div className="mt-6 flex items-center justify-between gap-3">
          {step > 0 ? (
            <Button variant="ghost" onClick={back} leftIcon={<ArrowLeft className="size-4" aria-hidden="true" />}>
              Back
            </Button>
          ) : (
            <span aria-hidden="true" />
          )}
          {isLast ? (
            <Button
              variant="primary"
              onClick={startLearning}
              rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
            >
              Start learning
            </Button>
          ) : (
            <Button variant="primary" onClick={next} rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}>
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
