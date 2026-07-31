"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

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
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pv-modal-title"
        className="relative z-10 w-full max-w-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-[var(--pv-shadow-level-2)]"
      >
        <div className="mb-md flex items-start justify-between gap-md">
          <h2 id="pv-modal-title" className="font-headline-md text-headline-md text-on-surface">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-sm py-xs font-label-md text-label-md text-on-surface-variant hover:text-on-surface"
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
