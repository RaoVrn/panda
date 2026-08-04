import { Outlet } from "react-router-dom";
import { ScrollToTop } from "@/app/ScrollToTop";

export function AppShell() {
  return (
    <div className="min-h-screen bg-base text-text">
      <ScrollToTop />
      <div className="mx-auto flex min-h-screen w-full max-w-[88rem] flex-col px-4 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
}