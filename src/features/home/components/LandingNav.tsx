import { BookOpen, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { useTheme } from "@/contexts/useTheme";
import { Brand } from "@/components/brand/Logo";

export function LandingNav() {
  const { theme, toggleTheme } = useTheme();
  const darkish = theme === "dark" || theme === "midnight";

  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-base/80 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="flex h-14 items-center"
      >
        <Link
          to="/"
          className="group flex shrink-0 items-center"
        >
          <span className="transition-transform duration-150 group-hover:scale-105">
            <Brand size={26} />
          </span>
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Link
            to="/docs"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-base-subtle hover:text-text sm:inline-flex"
          >
            <BookOpen className="size-4" aria-hidden="true" />
            Documentation
          </Link>
          <IconButton
            label="Documentation"
            href="/docs"
            className="sm:hidden"
          >
            <BookOpen className="size-4" aria-hidden="true" />
          </IconButton>
          <IconButton
            label={darkish ? "Switch to light theme" : "Switch to dark theme"}
            onClick={toggleTheme}
          >
            {darkish ? (
              <Moon className="size-4" aria-hidden="true" />
            ) : (
              <Sun className="size-4" aria-hidden="true" />
            )}
          </IconButton>
          <Button variant="secondary" size="sm" href="/login">
            Sign in
          </Button>
        </div>
      </nav>
    </header>
  );
}