export type LoaderProps = {
  label?: string;
  className?: string;
};

/** Indeterminate loader — quiet CRM utility style */
export function Loader({ label = "Loading", className = "" }: LoaderProps) {
  return (
    <div
      className={["flex flex-col items-center justify-center gap-sm p-lg", className]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-outline-variant border-t-primary"
        aria-hidden
      />
      <span className="text-body-sm text-on-surface-variant">{label}</span>
    </div>
  );
}
