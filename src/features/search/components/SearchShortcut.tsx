import { useEffect } from "react";
import { router } from "@/app/router";

/**
 * Global Cmd+K / Ctrl+K shortcut that opens search from any page. Mounted once
 * at the app root so it works on the landing page, dashboard and lessons.
 */
export function SearchShortcut() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        void router.navigate("/search");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
