"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { EmptyState, ErrorState, Loader } from "@/components/states";
import {
  AppError,
  listLeads,
  type Lead,
  type LeadStage,
} from "@/lib/api";
import { AddLeadModal } from "./AddLeadModal";

const STAGES: Array<{ value: "" | LeadStage; label: string }> = [
  { value: "", label: "All stages" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "visit_scheduled", label: "Visit scheduled" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function stageLabel(stage: string) {
  return stage.replace(/_/g, " ");
}

/** SCR-CLIENTS — lead list (no Kanban). */
export function LeadListPanel() {
  const [page, setPage] = useState(1);
  const [stage, setStage] = useState<"" | LeadStage>("");
  const [rows, setRows] = useState<Lead[]>([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listLeads({
        page,
        pageSize: 20,
        stage: stage || undefined,
      });
      setRows(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Failed to load leads");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, stage]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-xl px-xl py-xl">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Leads</h1>
          <p className="font-body-md mt-xs text-body-md text-on-surface-variant">
            Capture and triage inquiries. Pipeline board is out of MVP scope.
          </p>
        </div>
        <Button type="button" variant="primary" onClick={() => setAddOpen(true)}>
          Add lead
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-md">
        <label className="text-body-sm text-on-surface-variant">
          Stage
          <select
            className="mt-xs block min-w-[12rem] rounded-lg border border-outline-variant bg-white px-md py-sm text-body-sm text-on-surface"
            value={stage}
            onChange={(e) => {
              setPage(1);
              setStage(e.target.value as "" | LeadStage);
            }}
            aria-label="Filter by stage"
          >
            {STAGES.map((s) => (
              <option key={s.value || "all"} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <Button type="button" variant="secondary" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {loading && rows.length === 0 ? (
        <div className="flex justify-center py-xl">
          <Loader label="Loading leads" />
        </div>
      ) : error && rows.length === 0 ? (
        <ErrorState title="Leads unavailable" message={error} onRetry={() => void load()} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No leads yet"
          description="Add a lead manually or wait for homepage / property inquiries."
          action={
            <Button type="button" variant="primary" onClick={() => setAddOpen(true)}>
              Add lead
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-outline-variant bg-white shadow-sm">
          <table className="w-full min-w-[48rem] text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">
                  Name
                </th>
                <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">
                  Contact
                </th>
                <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">
                  Source
                </th>
                <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">
                  Stage
                </th>
                <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-outline-variant/60 hover:bg-surface-container-low/60"
                >
                  <td className="px-lg py-md">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="font-label-md text-label-md text-primary hover:underline"
                    >
                      {lead.name}
                    </Link>
                  </td>
                  <td className="px-lg py-md">
                    <div className="font-body-sm text-body-sm text-on-surface">{lead.email}</div>
                    {lead.phone ? (
                      <div className="font-body-sm text-body-sm text-on-surface-variant">
                        {lead.phone}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-lg py-md font-body-sm text-body-sm text-on-surface">
                    {lead.source.replace(/_/g, " ")}
                  </td>
                  <td className="px-lg py-md">
                    <span className="rounded-full bg-surface-container-high px-3 py-1 font-label-sm text-label-sm capitalize text-on-surface">
                      {stageLabel(lead.stage)}
                    </span>
                  </td>
                  <td className="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">
                    {formatWhen(lead.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-md">
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Page {meta.page} of {meta.totalPages} · {meta.total} leads
          </p>
          <div className="flex gap-sm">
            <Button
              type="button"
              variant="secondary"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={page >= meta.totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {error && rows.length > 0 ? (
        <p className="text-body-sm text-error" role="alert">
          {error}
        </p>
      ) : null}

      <AddLeadModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          setPage(1);
          void load();
        }}
      />
    </div>
  );
}
