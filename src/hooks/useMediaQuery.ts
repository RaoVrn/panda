import { useEffect, useState } from "react";

/**
 * Subscribe to a CSS media query. Returns true when it matches.
 * SSR-safe (returns false on first render if not available).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Large desktop breakpoint — where the sidebar rail and docked AI panel live. */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}