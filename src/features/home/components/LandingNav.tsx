import { Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { useTheme } from "@/contexts/useTheme";
import { Brand } from "@/components/brand/Logo";

export function LandingNav() {
  const { theme, toggleTheme } = useTheme();

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
          <IconButton
            label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
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