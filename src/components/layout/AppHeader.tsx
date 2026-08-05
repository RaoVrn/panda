import type { ReactNode } from "react";
import { Bell, Moon, Sparkles, Sun } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/user/auth/authContext";
import { UserMenu } from "@/features/user/components/UserMenu";
import { useTheme } from "@/contexts/useTheme";
import { SearchInput } from "@/components/ui/SearchInput";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/Button";
import { Brand } from "@/components/brand/Logo";

export interface AppHeaderProps {
  /** Extra leading content (e.g. a mobile menu button), shown on small screens. */
  leading?: ReactNode;
  /** Hide the brand so another surface (e.g. the course sidebar) owns it. */
  hideBrand?: boolean;
}

/**
 * The one header for every page: search, theme toggle, notifications
 * placeholder, Panda AI and the user menu. The avatar menu is ALWAYS top-right.
 * The brand shows by default and is hidden on the workspace, where the sidebar
 * owns it, so there's exactly one Panda logo per screen.
 */
export function AppHeader({ leading, hideBrand = false }: AppHeaderProps) {
  const { status } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  if (pathname === "/") return null;

  const authenticated = status === "authenticated";

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-base/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[88rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
        {leading && <div className="lg:hidden">{leading}</div>}
        {!hideBrand && (
          <Link
            to={authenticated ? "/course" : "/"}
            className="group flex shrink-0 items-center"
          >
            <span className="transition-transform duration-150 group-hover:scale-105">
              <Brand size={26} />
            </span>
          </Link>
        )}

        {authenticated ? (
          <>
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

            <div className="ml-auto flex shrink-0 items-center gap-1">
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
                label="Notifications (coming soon)"
                disabled
                title="Notifications coming soon"
                className="hidden sm:inline-flex"
              >
                <Bell className="size-4" aria-hidden="true" />
              </IconButton>
              <Button
                variant="ghost"
                size="sm"
                href="/ai"
                leftIcon={<Sparkles className="size-4 text-accent-hover" aria-hidden="true" />}
              >
                <span className="hidden sm:inline">Panda AI</span>
              </Button>
              <UserMenu />
            </div>
          </>
        ) : (
          <div className="ml-auto flex shrink-0 items-center gap-1">
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
        )}
      </div>
    </header>
  );
}
