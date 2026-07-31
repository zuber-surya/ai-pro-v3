import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

/**
 * Text input — DESIGN.md: 8px radius control, subtle border, 2px primary focus.
 */
export function Input({
  label,
  error,
  id,
  className = "",
  ...rest
}: InputProps) {
  const inputId = id ?? rest.name;

  return (
    <label className="flex w-full flex-col gap-xs">
      {label ? (
        <span className="font-label-md text-label-md text-on-surface">{label}</span>
      ) : null}
      <input
        id={inputId}
        className={[
          "w-full rounded-[var(--pv-radius-control)] border bg-surface-container-lowest px-md py-sm text-body-md text-on-surface",
          "placeholder:text-on-surface-variant",
          "border-border-subtle focus:border-2 focus:border-primary focus:outline-none",
          error ? "border-error focus:border-error" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        {...rest}
      />
      {error ? (
        <span id={inputId ? `${inputId}-error` : undefined} className="text-body-sm text-error">
          {error}
        </span>
      ) : null}
    </label>
  );
}
