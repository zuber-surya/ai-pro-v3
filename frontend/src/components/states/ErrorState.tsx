import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  action,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-start gap-md rounded-xl border border-error-container bg-error-container/40 p-lg",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="alert"
    >
      <div>
        <h3 className="font-headline-md text-headline-md text-on-error-container">{title}</h3>
        <p className="mt-xs text-body-md text-on-error-container">{message}</p>
      </div>
      {action}
      {!action && onRetry ? (
        <Button type="button" variant="primary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
