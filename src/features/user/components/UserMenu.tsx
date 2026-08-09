import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  UserPen,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/user/auth/authContext";
import { useProfile } from "@/features/user/hooks/useProfile";
import { Avatar } from "@/features/user/components/Avatar";
import { cn } from "@/lib/utils";

interface MenuItem {
  label: string;
  icon: LucideIcon;
  to: string;
}

// The profile is opened from the avatar card above; the menu holds the
// distinct actions (edit, dashboard, settings) plus sign out.
const MENU_ITEMS: MenuItem[] = [
  { label: "Edit profile", icon: UserPen, to: "/account" },
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

/**
 * The one avatar menu used on every authenticated page (top-right, via the
 * global header). Comfortably readable: generous width, clear sections,
 * distinct hover states, and a profile preview.
 */
export function UserMenu() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  const name = profile?.name || user?.email?.split("@")[0] || "Learner";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open account menu"
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-full transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          open && "ring-2 ring-accent/40",
        )}
      >
        <Avatar profile={profile} size={32} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-2xl"
          >
            {/* Profile preview */}
            <button
              type="button"
              onClick={() => go("/profile")}
              className="flex w-full items-center gap-3 border-b border-border-subtle bg-base-subtle/40 px-4 py-4 text-left transition-colors hover:bg-base-subtle"
            >
              <Avatar profile={profile} size={44} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-text">{name}</span>
                <span className="block truncate text-xs text-text-muted">
                  {user?.email ?? "Learner"}
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-accent-hover">
                  View profile
                </span>
              </span>
            </button>

            <div className="p-2">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onClick={() => go(item.to)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-base-subtle hover:text-text"
                >
                  <item.icon className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="border-t border-border-subtle p-2">
              <button
                type="button"
                role="menuitem"
                onClick={() => void signOut().then(() => navigate("/", { replace: true }))}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger-soft/40"
              >
                <LogOut className="size-4 shrink-0" aria-hidden="true" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
