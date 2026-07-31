export type SkeletonProps = {
  className?: string;
  /** Use AI shimmer for AI-loading surfaces only */
  ai?: boolean;
};

export function Skeleton({ className = "", ai = false }: SkeletonProps) {
  return (
    <div
      className={[
        "rounded-lg bg-surface-container-high",
        ai ? "ai-shimmer" : "animate-pulse",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    />
  );
}
