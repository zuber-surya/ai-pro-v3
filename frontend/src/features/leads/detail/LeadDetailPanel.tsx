"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { EmptyState, ErrorState, Loader } from "@/components/states";
import {
  AppError,
  createLeadNote,
  getLead,
  listLeadNotes,
  updateLeadStage,
  type Lead,
  type LeadNote,
  type LeadStage,
} from "@/lib/api";
import { ScheduleVisitModal } from "@/features/scheduling";

const STAGES: LeadStage[] = [
  "new",
  "contacted",
  "qualified",
  "visit_scheduled",
  "negotiation",
  "won",
  "lost",
];

function stageLabel(stage: string) {
  return stage.replace(/_/g, " ");
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function nextStage(current: string): LeadStage | null {
  const idx = STAGES.indexOf(current as LeadStage);
  if (idx < 0 || idx >= STAGES.length - 1) return null;
  return STAGES[idx + 1]!;
}

/** SCR-LEAD-D MVP subset — no reminder/timeline product engines. */
export function LeadDetailPanel({ leadId }: { leadId: string }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [stageBusy, setStageBusy] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [row, noteRows] = await Promise.all([
        getLead(leadId),
        listLeadNotes(leadId),
      ]);
      setLead(row);
      setNotes(noteRows);
    } catch (err) {
      setLead(null);
      setNotes([]);
      setError(err instanceof AppError ? err.message : "Could not load lead");
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function onPostNote(e?: FormEvent) {
    e?.preventDefault();
    if (!noteDraft.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const created = await createLeadNote(leadId, noteDraft.trim());
      setNotes((prev) => [created, ...prev]);
      setNoteDraft("");
      setToast("Note posted");
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Could not post note");
    } finally {
      setPosting(false);
    }
  }

  async function onStageChange(stage: LeadStage) {
    setStageBusy(true);
    setError(null);
    try {
      const updated = await updateLeadStage(leadId, stage);
      setLead(updated);
      setToast(`Stage → ${stageLabel(stage)}`);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Could not update stage");
    } finally {
      setStageBusy(false);
    }
  }

  async function onMoveNext() {
    if (!lead) return;
    const next = nextStage(lead.stage);
    if (!next) return;
    await onStageChange(next);
  }

  if (loading && !lead) {
    return (
      <div className="flex justify-center px-xl py-xl">
        <Loader label="Loading lead" />
      </div>
    );
  }

  if (error && !lead) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-md px-xl py-xl">
        <Link href="/admin/leads" className="font-label-md text-primary hover:underline">
          ← Back to leads
        </Link>
        <ErrorState title="Lead unavailable" message={error} onRetry={() => void load()} />
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="mx-auto max-w-[1400px] space-y-lg px-xl py-xl">
      <Link href="/admin/leads" className="font-label-md text-primary hover:underline">
        ← Back to leads
      </Link>

      {toast ? (
        <p className="rounded-lg bg-primary/10 px-md py-sm font-label-md text-primary" role="status">
          {toast}
        </p>
      ) : null}
      {error ? (
        <p className="text-body-sm text-error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="rounded-xl border border-outline-variant bg-white p-lg shadow-sm">
        <div className="flex flex-col justify-between gap-md md:flex-row md:items-center">
          <div className="flex flex-col gap-xs">
            <div className="flex flex-wrap items-center gap-md">
              <h1 className="font-headline-lg text-headline-lg text-on-surface">{lead.name}</h1>
              <span className="rounded-full bg-primary/10 px-sm py-[2px] font-label-md text-[12px] uppercase tracking-wider text-primary">
                {stageLabel(lead.stage)}
              </span>
              <span className="flex items-center gap-xs rounded-full bg-secondary/10 px-sm py-[2px] font-label-md text-label-md text-secondary">
                <span className="material-symbols-outlined text-[14px]" aria-hidden>
                  auto_awesome
                </span>
                Source: {lead.source.replace(/_/g, " ")}
              </span>
            </div>
            <div className="mt-xs flex flex-wrap items-center gap-lg">
              {lead.phone ? (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-xs font-body-sm text-body-sm text-on-surface-variant hover:text-primary"
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden>
                    call
                  </span>
                  {lead.phone}
                </a>
              ) : null}
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-xs font-body-sm text-body-sm text-on-surface-variant hover:text-primary"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden>
                  mail
                </span>
                {lead.email}
              </a>
              {lead.preferredContactTime ? (
                <span className="flex items-center gap-xs font-body-sm text-body-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden>
                    schedule
                  </span>
                  {lead.preferredContactTime}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-sm">
            <div className="mr-md flex flex-col items-end">
              <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                Pipeline Stage
              </span>
              <label className="sr-only" htmlFor="lead-stage">
                Stage
              </label>
              <select
                id="lead-stage"
                className="mt-xs rounded-lg border border-outline-variant bg-white px-sm py-xs font-label-md text-primary"
                value={lead.stage}
                disabled={stageBusy}
                onChange={(e) => void onStageChange(e.target.value as LeadStage)}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {stageLabel(s)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="mt-xs font-label-md text-primary hover:underline disabled:opacity-50"
                disabled={stageBusy || !nextStage(lead.stage)}
                onClick={() => void onMoveNext()}
              >
                Move to Next Stage
              </button>
            </div>
            <a
              href={`mailto:${lead.email}`}
              className="rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary transition-all hover:shadow-lg active:scale-95"
            >
              Send Email
            </a>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-lg md:grid-cols-12">
        <div className="space-y-lg md:col-span-8">
          <section className="rounded-xl border border-outline-variant bg-white p-lg shadow-sm">
            <h2 className="font-headline-md mb-lg text-headline-md text-on-surface">
              Notes &amp; Call Logs
            </h2>
            <form className="relative border-b border-outline-variant pb-lg" onSubmit={(e) => void onPostNote(e)}>
              <div className="flex items-start gap-md">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high">
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant" aria-hidden>
                    person
                  </span>
                </div>
                <div className="relative flex-1">
                  <label className="sr-only" htmlFor="note-draft">
                    Add a new note
                  </label>
                  <textarea
                    id="note-draft"
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Add a new note..."
                    className="h-24 w-full resize-none rounded-xl border border-outline-variant bg-surface-container-low p-md font-body-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
                  />
                  <div className="absolute right-3 bottom-3 flex gap-sm">
                    <Button type="submit" variant="primary" disabled={posting || !noteDraft.trim()}>
                      {posting ? "Posting…" : "Post Note"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {notes.length === 0 ? (
              <EmptyState title="No notes yet" description="Post the first note for this lead." />
            ) : (
              <div className="relative mt-lg space-y-lg before:absolute before:top-4 before:bottom-0 before:left-[15px] before:w-[2px] before:bg-outline-variant before:content-['']">
                {notes.map((note) => (
                  <div key={note.id} className="relative flex gap-md">
                    <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary-container bg-white">
                      <span
                        className="material-symbols-outlined text-[16px] text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                        aria-hidden
                      >
                        note
                      </span>
                    </div>
                    <div className="flex-1 rounded-xl border border-outline-variant bg-surface-container-low p-md">
                      <div className="mb-sm flex items-start justify-between gap-sm">
                        <div className="flex items-center gap-sm">
                          <span className="font-label-md text-on-surface">
                            {note.authorName ?? "Agent"}
                          </span>
                        </div>
                        <span className="shrink-0 font-body-sm text-outline">
                          {formatWhen(note.createdAt)}
                        </span>
                      </div>
                      <p className="font-body-md leading-relaxed text-on-surface-variant">
                        {note.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-outline-variant bg-white p-lg shadow-sm">
            <h2 className="font-headline-md mb-md text-headline-md text-on-surface">Follow-up</h2>
            <div className="flex flex-wrap gap-md">
              <Button
                type="button"
                variant="primary"
                disabled={!lead.propertyId}
                title={
                  lead.propertyId
                    ? undefined
                    : "Link a property on this lead before scheduling"
                }
                onClick={() => setScheduleOpen(true)}
              >
                <span className="material-symbols-outlined text-sm" aria-hidden>
                  event
                </span>
                Schedule Site Visit
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled
                title="Reminder engine is a Future product (out of MVP)"
              >
                Add reminder
              </Button>
            </div>
            <p className="mt-sm font-body-sm text-body-sm text-on-surface-variant">
              Reminders are not wired in MVP. Scheduling creates a visit request via POST /visits.
            </p>
          </section>
        </div>

        <div className="space-y-lg md:col-span-4">
          <section className="rounded-xl border border-outline-variant bg-white p-lg shadow-sm">
            <h2 className="font-headline-md mb-md text-headline-md text-on-surface">Interest</h2>
            {lead.message ? (
              <p className="font-body-md text-body-md text-on-surface-variant">{lead.message}</p>
            ) : (
              <p className="font-body-sm text-on-surface-variant">No inquiry message.</p>
            )}
            {lead.propertyId ? (
              <Link
                href={`/properties/${lead.propertyId}`}
                className="mt-md inline-flex items-center gap-xs font-label-md text-primary hover:underline"
              >
                View property
                <span className="material-symbols-outlined text-sm" aria-hidden>
                  arrow_forward
                </span>
              </Link>
            ) : null}
          </section>

          <section className="rounded-xl border border-outline-variant bg-white p-lg shadow-sm">
            <h2 className="font-headline-md mb-md text-headline-md text-on-surface">
              Stage History
            </h2>
            <p className="mb-md font-body-sm text-on-surface-variant">
              Current stage only (no timeline product in MVP).
            </p>
            <div className="rounded-lg bg-surface-container-low px-md py-sm">
              <p className="font-label-md capitalize text-on-surface">{stageLabel(lead.stage)}</p>
              <p className="font-body-sm text-on-surface-variant">
                Updated {formatWhen(lead.updatedAt)}
              </p>
            </div>
          </section>
        </div>
      </div>

      {lead.propertyId ? (
        <ScheduleVisitModal
          open={scheduleOpen}
          onClose={() => setScheduleOpen(false)}
          propertyId={lead.propertyId}
          leadId={lead.id}
          onCreated={() => {
            setToast("Visit request created");
            void load();
          }}
        />
      ) : null}
    </div>
  );
}
