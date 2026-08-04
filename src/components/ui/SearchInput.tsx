import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  shortcut?: string;
}

export function SearchInput({
  placeholder = "Search",
  shortcut,
  className,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("group relative", className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-text-secondary"
      />
      <input
        type="search"
        className={cn(
          "h-9 w-full rounded-lg border border-border-subtle bg-base-elevated pl-9 pr-12 text-sm",
          "text-text placeholder:text-text-muted transition-colors",
          "focus:border-border-strong focus:outline-none",
        )}
        placeholder={placeholder}
        {...props}
      />
      {shortcut && (
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border-subtle bg-base-subtle px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
          {shortcut}
        </kbd>
      )}
    </div>
  );
}