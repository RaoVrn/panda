import { Outlet, useLocation } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageTransition } from "@/components/layout/PageTransition";
import { ScrollToTop } from "@/app/ScrollToTop";

const BARE_ROUTES = ["/login", "/signup", "/reset-password"];

export function AppShell() {
  const { pathname } = useLocation();
  // Auth screens are standalone and sized to exactly one viewport, so they
  // skip the translate-based route transition (which would add a transient
  // scroll offset).
  const bare = BARE_ROUTES.includes(pathname);

  return (
    <div className="min-h-screen bg-base text-text">
      <ScrollToTop />
      <div className="mx-auto flex min-h-screen w-full max-w-[88rem] flex-col px-4 sm:px-6 lg:px-8">
        <AppHeader />
        {bare ? <Outlet /> : <PageTransition><Outlet /></PageTransition>}
      </div>
    </div>
  );
}
