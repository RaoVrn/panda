import { Suspense, lazy, type ComponentType } from "react";
import { RouteFallback } from "@/app/RouteFallback";

/**
 * Route-level code splitting.
 *
 * Every page is loaded on demand so the public landing page ships only what it
 * needs. `lazyPage` wraps `React.lazy` in a shared Suspense fallback so each
 * route keeps a calm, consistent loading state during chunk fetch.
 */
export function lazyPage(loader: () => Promise<ComponentType>) {
  const Page = lazy(() => loader().then((component) => ({ default: component })));
  return function LazyPage() {
    return (
      <Suspense fallback={<RouteFallback />}>
        <Page />
      </Suspense>
    );
  };
}
