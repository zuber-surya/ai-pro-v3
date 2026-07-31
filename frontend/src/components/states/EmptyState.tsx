import type { ReactNode } from "react";

export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Show search illustration when relevant */
  showSearchIllustration?: boolean;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  showSearchIllustration = false,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center gap-md px-md py-xl text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showSearchIllustration ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/assets/search-magnifying-glass.svg"
          alt=""
          width={160}
          height={160}
          className="mb-sm opacity-90"
        />
      ) : null}
      <h3 className="font-headline-md text-headline-md text-on-surface">{title}</h3>
      {description ? (
        <p className="max-w-md text-body-md text-on-surface-variant">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
