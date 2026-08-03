"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  AppError,
  aiChat,
  getChatGreeting,
  type ChatHistoryItem,
} from "@/lib/api";

type UiMessage = ChatHistoryItem & { id: string; pending?: boolean };

function mid() {
  return `m-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Homepage AI chat FAB — SCR-HOME / FEAT-12-01 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const greetingLoaded = useRef(false);

  useEffect(() => {
    if (!open || greetingLoaded.current) return;
    greetingLoaded.current = true;
    getChatGreeting()
      .then((g) => {
        setMessages([{ id: mid(), role: "assistant", content: g.greeting }]);
      })
      .catch(() => {
        setMessages([
          {
            id: mid(),
            role: "assistant",
            content:
              "Hello! I'm your AI real estate assistant. Ask me anything about local property trends or current listings.",
          },
        ]);
      });
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setError(null);
    setSending(true);

    const userMsg: UiMessage = { id: mid(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    const history: ChatHistoryItem[] = [...messages, userMsg]
      .filter((m) => !m.pending)
      .slice(-12)
      .map(({ role, content }) => ({ role, content }));

    try {
      const res = await aiChat({
        message: text,
        sessionId,
        context: { history: history.slice(0, -1) },
      });
      setSessionId(res.sessionId);
      setMessages((prev) => [
        ...prev,
        { id: mid(), role: "assistant", content: res.reply },
      ]);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Could not send message.");
    } finally {
      setSending(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <div className="fixed bottom-lg right-lg z-[100] flex flex-col items-end">
      {open ? (
        <div className="mb-md flex w-80 flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl">
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
          <div
            ref={listRef}
            className="h-64 space-y-md overflow-y-auto bg-surface-container-low p-md"
            aria-live="polite"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "assistant"
                    ? "max-w-[85%] rounded-lg rounded-tl-none bg-white p-sm text-body-sm text-on-surface shadow-sm"
                    : "ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-primary/10 p-sm text-body-sm text-on-surface"
                }
              >
                {m.content}
              </div>
            ))}
            {sending ? (
              <div className="max-w-[85%] rounded-lg rounded-tl-none bg-white p-sm text-body-sm text-on-surface-variant shadow-sm">
                Thinking…
              </div>
            ) : null}
            {error ? (
              <p className="text-body-sm text-error" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <form
            onSubmit={onSubmit}
            className="flex gap-sm border-t border-outline-variant bg-white p-sm"
          >
            <input
              className="flex-grow border-none text-body-sm focus:outline-none focus:ring-0"
              placeholder="Type a message..."
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={sending}
              aria-label="Chat message"
            />
            <button
              type="submit"
              className="material-symbols-outlined text-ai-accent disabled:opacity-40"
              disabled={sending || !input.trim()}
              aria-label="Send message"
            >
              send
            </button>
          </form>
        </div>
      ) : null}
      <button
        type="button"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-ai-accent text-white shadow-xl transition-transform hover:scale-110 active:scale-95"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
      >
        <span className="material-symbols-outlined text-[28px]" aria-hidden>
          chat
        </span>
        {!open ? (
          <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-error" />
        ) : null}
      </button>
    </div>
  );
}
