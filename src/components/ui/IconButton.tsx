import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface IconButtonBaseProps {
  label: string;
  children: ReactNode;
  className?: string;
}

type IconButtonAsButton = IconButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type IconButtonAsLink = IconButtonBaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type IconButtonProps = IconButtonAsButton | IconButtonAsLink;

export function IconButton({ label, className, children, ...props }: IconButtonProps) {
  const classes = cn(
    "inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
    "text-text-secondary transition-colors duration-150",
    "hover:bg-base-subtle hover:text-text",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    className,
  );

  if ("href" in props && props.href) {
    const { href, ...rest } = props as IconButtonAsLink;
    return (
      <a href={href} aria-label={label} title={label} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  const { type = "button", ...rest } = props as IconButtonAsButton;
  return (
    <button type={type} aria-label={label} title={label} className={classes} {...rest}>
      {children}
    </button>
  );
}