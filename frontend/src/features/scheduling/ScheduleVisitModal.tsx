"use client";

import { useState, type FormEvent } from "react";
import { AppError, createVisit } from "@/lib/api";
import { Button, Input, Modal } from "@/components/ui";

export type ScheduleVisitModalProps = {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  leadId?: string;
  onCreated?: () => void;
};

/** SCR-SCHED — schedule visit request modal */
export function ScheduleVisitModal({
  open,
  onClose,
  propertyId,
  leadId,
  onCreated,
}: ScheduleVisitModalProps) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function reset() {
    setScheduledAt("");
    setNotes("");
    setError(null);
    setSuccess(null);
  }

  function handleClose() {
    if (busy) return;
    reset();
    onClose();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!scheduledAt) {
      setError("Pick a visit date and time");
      return;
    }
    const when = new Date(scheduledAt);
    if (Number.isNaN(when.getTime()) || when.getTime() < Date.now() - 60_000) {
      setError("Visit time must be in the future");
      return;
    }

    setBusy(true);
    try {
      await createVisit({
        propertyId,
        scheduledAt: when.toISOString(),
        notes: notes.trim() || undefined,
        leadId,
      });
      setSuccess("Visit request submitted. An agent will confirm shortly.");
      onCreated?.();
      setScheduledAt("");
      setNotes("");
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Could not schedule visit");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Schedule Visit"
      onClose={handleClose}
      footer={
        success ? (
          <Button type="button" variant="primary" onClick={handleClose}>
            Done
          </Button>
        ) : (
          <>
            <Button type="button" variant="secondary" disabled={busy} onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" form="schedule-visit-form" variant="primary" disabled={busy}>
              {busy ? "Submitting…" : "Request visit"}
            </Button>
          </>
        )
      }
    >
      {success ? (
        <p className="text-body-md text-on-surface" role="status">
          {success}
        </p>
      ) : (
        <form
          id="schedule-visit-form"
          className="flex flex-col gap-md"
          onSubmit={(e) => void onSubmit(e)}
        >
          <Input
            label="Date & time"
            type="datetime-local"
            name="scheduledAt"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />
          <label className="flex flex-col gap-xs">
            <span className="font-label-md text-label-md text-on-surface">Notes (optional)</span>
            <textarea
              name="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-[var(--pv-radius-control)] border border-border-subtle bg-surface-container-lowest px-md py-sm text-body-md outline-none focus:border-2 focus:border-primary"
            />
          </label>
          {error ? (
            <p className="text-body-sm text-error" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      )}
    </Modal>
  );
}
