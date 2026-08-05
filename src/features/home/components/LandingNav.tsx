import { Github, Moon, Sparkles, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { SearchInput } from "@/components/ui/SearchInput";
import { useTheme } from "@/contexts/useTheme";
import { Brand } from "@/components/brand/Logo";

export function LandingNav() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-base/80 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="flex h-14 items-center gap-4"
      >
        <Link
          to="/"
          className="group flex shrink-0 items-center"
        >
          <span className="transition-transform duration-150 group-hover:scale-105">
            <Brand size={26} />
          </span>
        </Link>

        <SearchInput
          className="mx-auto hidden w-full max-w-sm cursor-pointer md:flex"
          placeholder="Search lessons, commands, concepts..."
          shortcut="⌘K"
          aria-label="Search"
          readOnly
          onClick={() => navigate("/search")}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate("/search");
          }}
        />

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
          <IconButton
            label="Panda on GitHub"
            href="https://github.com/RaoVrn"
            target="_blank"
            rel="noreferrer noopener"
          >
            <Github className="size-4" aria-hidden="true" />
          </IconButton>
          <Button
            variant="secondary"
            size="sm"
            href="/ai"
            leftIcon={<Sparkles className="size-4 text-accent-hover" aria-hidden="true" />}
          >
            Panda AI
          </Button>
        </div>
      </nav>
    </header>
  );
}