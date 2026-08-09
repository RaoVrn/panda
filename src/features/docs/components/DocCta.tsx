import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/features/user/auth/authContext";

/**
 * A documentation call-to-action button that navigates to a real Panda page.
 * Public targets (documentation pages) link directly for everyone. Protected
 * targets show the destination for signed-in users and a "Sign in to continue"
 * link for visitors, so no dead or confusing links are ever shown.
 */
export function DocCta({
  label,
  to,
  auth,
}: {
  label: string;
  to: string;
  auth?: string;
}) {
  const { status } = useAuth();
  const authenticated = status === "authenticated";

  if (auth && !authenticated) {
    return (
      <Link
        to="/login"
        className="group inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-base-subtle px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text"
      >
        Sign in to continue
        <ArrowRight
          className="size-3.5 text-text-muted transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-text-inverse shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-colors hover:bg-accent-hover ring-1 ring-inset ring-white/10"
    >
      {label}
      <ArrowRight
        className="size-3.5 transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}
