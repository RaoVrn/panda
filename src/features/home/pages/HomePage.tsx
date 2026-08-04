import { lazy, Suspense } from "react";
import { LandingNav } from "@/features/home/components/LandingNav";
import { Hero } from "@/features/home/components/Hero";
import { LivePreview } from "@/features/home/components/LivePreview";
import { SectionSkeleton } from "@/features/home/components/SectionSkeleton";

const FeatureGrid = lazy(() =>
  import("@/features/home/components/FeatureGrid").then((m) => ({
    default: m.FeatureGrid,
  })),
);
const HowItWorks = lazy(() =>
  import("@/features/home/components/HowItWorks").then((m) => ({
    default: m.HowItWorks,
  })),
);
const WhyPanda = lazy(() =>
  import("@/features/home/components/WhyPanda").then((m) => ({
    default: m.WhyPanda,
  })),
);
const Roadmap = lazy(() =>
  import("@/features/home/components/Roadmap").then((m) => ({
    default: m.Roadmap,
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

export function HomePage() {
  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <LivePreview />
        <Suspense fallback={<SectionSkeleton rows={2} />}>
          <FeatureGrid />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <HowItWorks />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <WhyPanda />
        </Suspense>
        <Suspense fallback={<SectionSkeleton rows={2} />}>
          <Roadmap />
        </Suspense>
        <Suspense fallback={<SectionSkeleton compact />}>
          <FinalCta />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
}