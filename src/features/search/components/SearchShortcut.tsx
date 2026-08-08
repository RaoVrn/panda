import { useEffect } from "react";
import { router } from "@/app/router";
import { useAuth } from "@/features/user/auth/authContext";

/**
 * Global Cmd+K / Ctrl+K shortcut that opens search from any authenticated page
 * in the learning experience. Mounted at the app root inside the auth provider,
 * and inert for signed-out visitors.
 */
export function SearchShortcut() {
  const { status } = useAuth();

  useEffect(() => {
    if (status !== "authenticated") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        void router.navigate("/search");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status]);

  return null;
}
