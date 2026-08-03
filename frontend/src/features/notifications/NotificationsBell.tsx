"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AppError,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      setItems([]);
      setUnreadCount(0);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await listNotifications({ page: 1, pageSize: 20 });
      setItems(res.data);
      setUnreadCount(res.meta.unreadCount ?? 0);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    void load();
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, load]);

  async function onMarkOne(id: string) {
    try {
      const updated = await markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? updated : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* keep list */
    }
  }

  async function onMarkAll() {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      /* keep list */
    }
  }

  if (!getAccessToken()) return null;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="relative rounded-lg p-2 text-on-surface-variant transition-colors hover:text-primary"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="material-symbols-outlined" aria-hidden>
          notifications
        </span>
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-error">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[var(--pv-shadow-level-2)]"
        >
          <div className="flex items-center justify-between border-b border-outline-variant px-md py-sm">
            <p className="font-label-md font-bold text-on-surface">Notifications</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                className="font-label-sm text-primary hover:underline"
                onClick={() => void onMarkAll()}
              >
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="px-md py-lg text-body-sm text-on-surface-variant">Loading…</p>
            ) : null}
            {error ? (
              <p className="px-md py-lg text-body-sm text-error" role="alert">
                {error}
              </p>
            ) : null}
            {!loading && !error && items.length === 0 ? (
              <p className="px-md py-lg text-body-sm text-on-surface-variant">
                No notifications yet.
              </p>
            ) : null}
            <ul className="divide-y divide-outline-variant">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={[
                      "flex w-full flex-col gap-xs px-md py-sm text-left hover:bg-surface-container-low",
                      n.read ? "opacity-70" : "bg-primary/5",
                    ].join(" ")}
                    onClick={() => {
                      if (!n.read) void onMarkOne(n.id);
                    }}
                  >
                    <div className="flex items-start justify-between gap-sm">
                      <p className="font-label-md font-bold text-on-surface">{n.title}</p>
                      {!n.read ? (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                      ) : null}
                    </div>
                    {n.body ? (
                      <p className="line-clamp-2 text-body-sm text-on-surface-variant">{n.body}</p>
                    ) : null}
                    <p className="text-[11px] text-on-surface-variant">{relativeTime(n.createdAt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
