"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";

export type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Modal shell — Level 2 elevation (DESIGN.md). Presentation only.
 */
export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusable = panel?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const nodes = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
      if (nodes.length === 0) return;
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-md"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-inverse-surface/40"
        aria-label="Close dialog"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-[var(--pv-shadow-level-2)]"
      >
        <div className="mb-md flex items-start justify-between gap-md">
          <h2 id={titleId} className="font-headline-md text-headline-md text-on-surface">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-sm py-xs font-label-md text-label-md text-on-surface-variant hover:text-on-surface focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close"
          >
            Close
          </button>
        </div>
        <div className="text-body-md text-on-surface">{children}</div>
        {footer ? <div className="mt-lg flex justify-end gap-sm">{footer}</div> : null}
      </div>
    </div>
  );
}
