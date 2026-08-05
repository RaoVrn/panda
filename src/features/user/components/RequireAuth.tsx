import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/user/auth/authContext";
import { Logo } from "@/components/brand/Logo";

/**
 * Guards protected routes.
 *
 *  · unconfigured → allow (anonymous mode; there's no auth to enforce)
 *  · loading     → branded loading screen
 *  · unauthenticated → redirect to /login
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-base">
        <Logo size={48} />
        <span
          aria-label="Loading"
          className="size-6 animate-spin rounded-full border-2 border-border-subtle border-t-accent"
        />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
