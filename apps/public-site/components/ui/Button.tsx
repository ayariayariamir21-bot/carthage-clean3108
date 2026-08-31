import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-400",
  secondary: "bg-accent-600 text-white hover:bg-accent-700 focus-visible:ring-accent-400",
  outline: "border border-brand-600 text-brand-600 hover:bg-brand-50 focus-visible:ring-brand-400",
  ghost: "text-brand-600 hover:bg-brand-50 focus-visible:ring-brand-400",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className ?? ""}`;

  if (href) {
    const external = href.startsWith("http");
    if (external) {
      return (
        <a href={href} className={classes} target="_blank" rel="noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
