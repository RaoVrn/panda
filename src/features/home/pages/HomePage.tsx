import { lazy, Suspense } from "react";
import { LandingNav } from "@/features/home/components/LandingNav";
import { Hero } from "@/features/home/components/Hero";
import { ProductShowcase } from "@/features/home/components/ProductShowcase";
import { SectionSkeleton } from "@/features/home/components/SectionSkeleton";

const PlaygroundSection = lazy(() =>
  import("@/features/home/components/PlaygroundSection").then((m) => ({
    default: m.PlaygroundSection,
  })),
);
const PandaAiSection = lazy(() =>
  import("@/features/home/components/PandaAiSection").then((m) => ({
    default: m.PandaAiSection,
  })),
);
const SocialProof = lazy(() =>
  import("@/features/home/components/SocialProof").then((m) => ({
    default: m.SocialProof,
  })),
);
const WhyPanda = lazy(() =>
  import("@/features/home/components/WhyPanda").then((m) => ({
    default: m.WhyPanda,
  })),
);
const LearningFlow = lazy(() =>
  import("@/features/home/components/LearningFlow").then((m) => ({
    default: m.LearningFlow,
  })),
);
const FeatureGrid = lazy(() =>
  import("@/features/home/components/FeatureGrid").then((m) => ({
    default: m.FeatureGrid,
  })),
);
const Roadmap = lazy(() =>
  import("@/features/home/components/Roadmap").then((m) => ({
    default: m.Roadmap,
  })),
);
const Faq = lazy(() =>
  import("@/features/home/components/Faq").then((m) => ({
    default: m.Faq,
  })),
);
const FinalCta = lazy(() =>
  import("@/features/home/components/FinalCta").then((m) => ({
    default: m.FinalCta,
  })),
);
const Footer = lazy(() =>
  import("@/features/home/components/Footer").then((m) => ({
    default: m.Footer,
  })),
);
const DocsCta = lazy(() =>
  import("@/features/home/components/DocsCta").then((m) => ({
    default: m.DocsCta,
  })),
);

export function HomePage() {
  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <ProductShowcase />
        <Suspense fallback={<SectionSkeleton compact />}>
          <SocialProof />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <PlaygroundSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <PandaAiSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <WhyPanda />
        </Suspense>
        <Suspense fallback={<SectionSkeleton compact />}>
          <LearningFlow />
        </Suspense>
        <Suspense fallback={<SectionSkeleton rows={2} />}>
          <FeatureGrid />
        </Suspense>
        <Suspense fallback={<SectionSkeleton rows={2} />}>
          <Roadmap />
        </Suspense>
        <Suspense fallback={<SectionSkeleton compact />}>
          <Faq />
        </Suspense>
        <Suspense fallback={null}>
          <FinalCta />
        </Suspense>
        <Suspense fallback={null}>
          <DocsCta />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
}
