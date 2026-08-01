"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AppError, createLead } from "@/lib/api";
import { getAccessToken, getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export type DetailCtasProps = {
  propertyId: string;
  propertyTitle: string;
  agentPhone?: string | null;
  agentEmail?: string | null;
};

type CtaMode = "inquire" | "callback" | "schedule" | null;

function newIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `lead-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function DetailCtas({
  propertyId,
  propertyTitle,
  agentPhone,
  agentEmail,
}: DetailCtasProps) {
  const router = useRouter();
  const [mode, setMode] = useState<CtaMode>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const title = useMemo(() => {
    if (mode === "callback") return "Request Callback";
    if (mode === "schedule") return "Schedule Visit";
    if (mode === "inquire") return "Inquire About This Property";
    return "";
  }, [mode]);

  function open(next: CtaMode) {
    setMode(next);
    setError(null);
    setSuccess(null);
    const user = getCurrentUser();
    if (user) {
      setName(user.fullName ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
    }
  }

  function close() {
    if (submitting) return;
    setMode(null);
  }

  function onFavorite() {
    if (!getAccessToken() && !getCurrentUser()) {
      router.push(`/login?next=${encodeURIComponent(`/properties/${propertyId}`)}`);
      return;
    }
    setSuccess("Favorites will be available soon. You’re signed in.");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!mode) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const source =
      mode === "callback"
        ? "property_callback"
        : mode === "schedule"
          ? "property_schedule"
          : "property_inquire";

    const composedMessage = [
      message.trim(),
      mode === "schedule" && scheduledAt ? `Preferred visit: ${scheduledAt}` : "",
      mode === "callback" && preferredTime ? `Preferred callback: ${preferredTime}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await createLead(
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          preferredContactTime:
            mode === "callback" ? preferredTime.trim() || undefined : preferredTime.trim() || undefined,
          message: composedMessage || undefined,
          source,
          propertyId,
        },
        newIdempotencyKey(),
      );
      setSuccess(
        mode === "schedule"
          ? "Visit request sent. An agent will confirm shortly."
          : mode === "callback"
            ? "Callback request sent. We’ll contact you soon."
            : "Inquiry sent. An agent will follow up shortly.",
      );
      setMessage("");
      setPreferredTime("");
      setScheduledAt("");
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Could not submit request");
    } finally {
      setSubmitting(false);
    }
  }

  const mailto = agentEmail
    ? `mailto:${agentEmail}?subject=${encodeURIComponent(`Inquiry: ${propertyTitle}`)}`
    : null;
  const tel = agentPhone ? `tel:${agentPhone}` : null;

  return (
    <>
      {success && !mode ? (
        <div
          className="fixed bottom-24 left-1/2 z-40 w-[min(92vw,28rem)] -translate-x-1/2 rounded-xl border border-outline-variant bg-white px-md py-sm text-center font-body-sm text-on-surface shadow-level-2 lg:bottom-8"
          role="status"
        >
          {success}
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-50 bg-white px-lg py-md shadow-[0_-4px_24px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="mx-auto flex max-w-container-max gap-md">
          <button
            type="button"
            className="flex-1 rounded-lg border border-primary py-md font-label-md text-primary hover:bg-primary/5"
            onClick={() => open("callback")}
          >
            Request Callback
          </button>
          <button
            type="button"
            className="flex-1 rounded-lg bg-primary py-md font-label-md text-white shadow-sm hover:opacity-90"
            onClick={() => open("schedule")}
          >
            Schedule Visit
          </button>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-40 hidden flex-col gap-md lg:flex">
        <button
          type="button"
          onClick={onFavorite}
          className="flex items-center gap-md rounded-full border border-outline-variant bg-white px-lg py-md font-label-md text-on-surface shadow-level-2 hover:shadow-lg"
          aria-label="Save favorite"
        >
          <span className="material-symbols-outlined text-primary" aria-hidden>
            favorite
          </span>
          Favorite
        </button>
        <button
          type="button"
          onClick={() => open("schedule")}
          className="flex items-center gap-md rounded-full border border-outline-variant bg-white px-lg py-md font-label-md text-on-surface shadow-level-2 hover:shadow-lg"
        >
          <span className="material-symbols-outlined text-primary" aria-hidden>
            calendar_today
          </span>
          Schedule Visit
        </button>
        <button
          type="button"
          onClick={() => open("callback")}
          className="flex items-center gap-md rounded-full bg-primary px-lg py-md font-label-md text-white shadow-level-2 hover:opacity-90"
        >
          <span className="material-symbols-outlined" aria-hidden>
            call
          </span>
          Request Callback
        </button>
        <button
          type="button"
          onClick={() => open("inquire")}
          className="flex items-center gap-md rounded-full bg-secondary px-lg py-md font-label-md text-white shadow-level-2 hover:opacity-90"
        >
          <span className="material-symbols-outlined" aria-hidden>
            chat_bubble
          </span>
          Inquire
        </button>
      </div>

      <div className="mt-md flex flex-wrap gap-sm lg:hidden">
        <Button type="button" variant="secondary" onClick={() => open("inquire")}>
          Inquire
        </Button>
        <Button type="button" variant="ghost" onClick={onFavorite}>
          Favorite
        </Button>
        {tel ? (
          <a
            href={tel}
            className="inline-flex items-center justify-center rounded-lg border border-border-subtle px-lg py-sm font-label-md text-label-md"
          >
            Call
          </a>
        ) : null}
        {mailto ? (
          <a
            href={mailto}
            className="inline-flex items-center justify-center rounded-lg border border-border-subtle px-lg py-sm font-label-md text-label-md"
          >
            Email
          </a>
        ) : null}
      </div>

      <Modal open={mode != null} title={title} onClose={close}>
        {success ? (
          <div className="space-y-md">
            <p className="text-body-md text-on-surface" role="status">
              {success}
            </p>
            <Button type="button" onClick={close}>
              Done
            </Button>
          </div>
        ) : (
          <form className="space-y-md" onSubmit={onSubmit}>
            <Input
              label="Name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {mode === "callback" ? (
              <Input
                label="Preferred callback time"
                name="preferredContactTime"
                placeholder="e.g. Weekdays after 6pm"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
              />
            ) : null}
            {mode === "schedule" ? (
              <Input
                label="Preferred visit datetime"
                name="scheduledAt"
                type="datetime-local"
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            ) : null}
            <label className="flex w-full flex-col gap-xs">
              <span className="font-label-md text-label-md text-on-surface">Message</span>
              <textarea
                name="message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-[var(--pv-radius-control)] border border-border-subtle bg-surface-container-lowest px-md py-sm text-body-md text-on-surface focus:border-2 focus:border-primary focus:outline-none"
              />
            </label>
            {error ? (
              <p className="text-body-sm text-error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex flex-wrap justify-end gap-sm">
              {tel && mode === "callback" ? (
                <a
                  href={tel}
                  className="inline-flex items-center justify-center rounded-lg border border-border-subtle px-lg py-sm font-label-md"
                >
                  Call now
                </a>
              ) : null}
              {mailto && mode === "inquire" ? (
                <a
                  href={mailto}
                  className="inline-flex items-center justify-center rounded-lg border border-border-subtle px-lg py-sm font-label-md"
                >
                  Email agent
                </a>
              ) : null}
              <Button type="button" variant="ghost" onClick={close} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Sending…" : "Submit"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
