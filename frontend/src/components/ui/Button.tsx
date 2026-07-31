import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "ai";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-container shadow-sm active:opacity-80",
  secondary:
    "border border-border-subtle bg-transparent text-on-surface hover:border-outline",
  ghost: "bg-transparent text-on-surface hover:text-primary",
  ai: "bg-ai-accent text-white hover:bg-ai-accent/90 shadow-md active:scale-95",
};

/**
 * Shared button — variants from DESIGN.md Components / HTML CTAs.
 * AI variant only for AI-specific actions.
 */
export function Button({
  variant = "primary",
  className = "",
  type = "button",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-xs rounded-lg px-lg py-sm font-label-md text-label-md transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClass[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
