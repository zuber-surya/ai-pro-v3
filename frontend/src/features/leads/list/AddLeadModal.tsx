"use client";

import { useState, type FormEvent } from "react";
import { Button, Input, Modal } from "@/components/ui";
import { AppError, createLead } from "@/lib/api";

export function AddLeadModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [preferredContactTime, setPreferredContactTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function reset() {
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setPreferredContactTime("");
    setFormError(null);
  }

  function handleClose() {
    if (saving) return;
    reset();
    onClose();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) {
      setFormError("Name is required");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError("Enter a valid email");
      return;
    }
    setSaving(true);
    try {
      await createLead(
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: message.trim() || undefined,
          preferredContactTime: preferredContactTime.trim() || undefined,
          source: "manual_add",
        },
        crypto.randomUUID(),
      );
      reset();
      onCreated();
      onClose();
    } catch (err) {
      setFormError(err instanceof AppError ? err.message : "Could not create lead");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Add lead"
      onClose={handleClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="add-lead-form" variant="primary" disabled={saving}>
            {saving ? "Saving…" : "Create lead"}
          </Button>
        </>
      }
    >
      <form id="add-lead-form" className="flex flex-col gap-md" onSubmit={(e) => void onSubmit(e)}>
        <Input
          label="Name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Input
          label="Preferred contact time"
          name="preferredContactTime"
          value={preferredContactTime}
          onChange={(e) => setPreferredContactTime(e.target.value)}
        />
        <label className="flex flex-col gap-xs">
          <span className="font-label-md text-label-md text-on-surface">Message</span>
          <textarea
            name="message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-[var(--pv-radius-control)] border border-border-subtle bg-surface-container-lowest px-md py-sm text-body-md text-on-surface focus:border-2 focus:border-primary focus:outline-none"
          />
        </label>
        {formError ? (
          <p className="text-body-sm text-error" role="alert">
            {formError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
