"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { EmptyState, ErrorState, Loader } from "@/components/states";
import {
  AppError,
  listNotificationRules,
  updateNotificationRule,
  type NotificationChannel,
  type NotificationRule,
} from "@/lib/api";

const EVENT_LABELS: Record<string, string> = {
  new_lead: "New lead created",
  "lead.created": "New lead created",
};

function channelLabel(c: NotificationChannel) {
  return c === "email" ? "Email" : "In-app";
}

export function NotificationRulesPanel() {
  const [rows, setRows] = useState<NotificationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listNotificationRules({ page: 1, pageSize: 50 });
      setRows(res.data);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Failed to load rules");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function persist(rule: NotificationRule, next: Partial<NotificationRule>) {
    setSavingId(rule.id);
    setError(null);
    try {
      const updated = await updateNotificationRule(rule.id, {
        channels: next.channels ?? rule.channels,
        enabled: next.enabled ?? rule.enabled,
      });
      setRows((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
      setToast("Rule saved");
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Failed to save rule");
    } finally {
      setSavingId(null);
    }
  }

  function toggleEnabled(rule: NotificationRule) {
    void persist(rule, { enabled: !rule.enabled });
  }

  function toggleChannel(rule: NotificationRule, channel: NotificationChannel) {
    const has = rule.channels.includes(channel);
    let channels: NotificationChannel[];
    if (has) {
      channels = rule.channels.filter((c) => c !== channel);
      if (channels.length === 0) {
        void persist(rule, { enabled: false, channels: rule.channels });
        return;
      }
    } else {
      channels = [...rule.channels, channel];
    }
    void persist(rule, { channels, enabled: true });
  }

  if (loading) {
    return (
      <div className="py-xl">
        <Loader label="Loading notification rules…" />
      </div>
    );
  }

  if (error && rows.length === 0) {
    return <ErrorState message={error} onRetry={() => void load()} />;
  }

  return (
    <div className="space-y-lg">
      <div className="flex flex-wrap items-end justify-between gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Notification Rules</h1>
          <p className="text-body-md text-on-surface-variant">
            Configure email and in-app alerts. SMS, WhatsApp, and push are not available.
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg bg-error-container px-md py-sm text-body-sm text-on-error-container" role="alert">
          {error}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState title="No rules" description="Default new-lead rules will appear after seed." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
          <table className="w-full text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="px-md py-sm font-label-md text-on-surface-variant">Event</th>
                <th className="px-md py-sm font-label-md text-on-surface-variant">Channels</th>
                <th className="px-md py-sm font-label-md text-on-surface-variant">Enabled</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((rule) => {
                const busy = savingId === rule.id;
                return (
                  <tr key={rule.id} className="border-b border-outline-variant last:border-0">
                    <td className="px-md py-md">
                      <p className="font-label-md font-bold text-on-surface">
                        {EVENT_LABELS[rule.event] ?? rule.event}
                      </p>
                      <p className="text-body-sm text-on-surface-variant">{rule.event}</p>
                    </td>
                    <td className="px-md py-md">
                      <div className="flex flex-wrap gap-md">
                        {(["email", "in_app"] as const).map((channel) => {
                          const on = rule.enabled && rule.channels.includes(channel);
                          return (
                            <label
                              key={channel}
                              className="inline-flex items-center gap-xs font-label-md text-on-surface"
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                                checked={on}
                                disabled={busy || !rule.enabled}
                                onChange={() => toggleChannel(rule, channel)}
                              />
                              {channelLabel(channel)}
                            </label>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-md py-md">
                      <label className="inline-flex items-center gap-sm font-label-md">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                          checked={rule.enabled}
                          disabled={busy}
                          onChange={() => toggleEnabled(rule)}
                        />
                        {rule.enabled ? "On" : "Off"}
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {toast ? (
        <div
          className="fixed bottom-lg right-lg z-[100] rounded-lg bg-inverse-surface px-lg py-md font-label-md text-inverse-on-surface shadow-2xl"
          role="status"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
