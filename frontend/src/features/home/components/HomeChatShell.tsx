"use client";

import { useState } from "react";

/** Chat FAB shell — full Gemini chat in Sprint 9 (FEAT-12-01). */
export function HomeChatShell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-lg right-lg z-[100] flex flex-col items-end">
      {open ? (
        <div className="mb-md w-80 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl">
          <div className="flex items-center justify-between bg-ai-accent p-md text-white">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined" aria-hidden>
                smart_toy
              </span>
              <span className="font-label-md">PropVista AI Assistant</span>
            </div>
            <button
              type="button"
              className="material-symbols-outlined text-[20px]"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              close
            </button>
          </div>
          <div className="h-64 space-y-md overflow-y-auto bg-surface-container-low p-md">
            <div className="max-w-[85%] rounded-lg rounded-tl-none bg-white p-sm text-body-sm text-on-surface shadow-sm">
              Hello! I&apos;m your AI real estate assistant. Full chat arrives soon — try AI search
              on the homepage for now.
            </div>
          </div>
          <div className="flex gap-sm border-t border-outline-variant bg-white p-sm">
            <input
              className="flex-grow border-none text-body-sm focus:outline-none focus:ring-0"
              placeholder="Type a message..."
              type="text"
              disabled
              aria-label="Chat message (coming soon)"
            />
            <button
              type="button"
              className="material-symbols-outlined text-ai-accent opacity-50"
              disabled
              aria-label="Send (coming soon)"
            >
              send
            </button>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-ai-accent text-white shadow-xl transition-transform hover:scale-110 active:scale-95"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Open AI assistant"
      >
        <span className="material-symbols-outlined text-[28px]" aria-hidden>
          chat
        </span>
        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-error" />
      </button>
    </div>
  );
}
