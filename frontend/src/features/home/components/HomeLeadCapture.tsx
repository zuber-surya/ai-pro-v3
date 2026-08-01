"use client";

import { useState, type FormEvent } from "react";
import { AppError, createLead } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function newIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `home-lead-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Homepage contact / lead capture — FR-HOME-006 */
export function HomeLeadCapture() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredContactTime, setPreferredContactTime] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function validate() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required";
    if (!email.trim()) next.email = "Email is required";
    else if (!isValidEmail(email.trim())) next.email = "Enter a valid email";
    if (phone.trim() && phone.trim().length < 7) next.phone = "Enter a valid phone";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await createLead(
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          preferredContactTime: preferredContactTime.trim() || undefined,
          message: message.trim() || undefined,
          source: "homepage_contact",
        },
        newIdempotencyKey(),
      );
      setSuccess("Thanks — we received your message and will follow up shortly.");
      setName("");
      setEmail("");
      setPhone("");
      setPreferredContactTime("");
      setMessage("");
      setErrors({});
    } catch (err) {
      if (err instanceof AppError) {
        setFormError(err.message);
      } else {
        setFormError("Could not submit. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-surface-container py-xl" id="contact">
      <div className="mx-auto grid max-w-container-max gap-xl px-xl md:grid-cols-2 md:items-start">
        <div>
          <h2 className="font-headline-lg mb-md text-headline-lg text-on-surface">
            Talk to a PropVista specialist
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Share a few details and we&apos;ll match you with an agent. No spam — just a helpful
            follow-up.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm"
          noValidate
        >
          <Input
            label="Full name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            autoComplete="name"
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
            required
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            autoComplete="tel"
            placeholder="+91 …"
          />
          <Input
            label="Preferred callback time"
            name="preferredContactTime"
            value={preferredContactTime}
            onChange={(e) => setPreferredContactTime(e.target.value)}
            placeholder="e.g. Weekday evenings"
          />
          <label className="flex w-full flex-col gap-xs">
            <span className="font-label-md text-label-md text-on-surface">Message</span>
            <textarea
              name="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full rounded-[var(--pv-radius-control)] border border-border-subtle bg-surface-container-lowest px-md py-sm text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-2 focus:border-primary focus:outline-none"
            />
          </label>

          {formError ? (
            <p className="font-body-sm text-error" role="alert">
              {formError}
            </p>
          ) : null}
          {success ? (
            <p className="font-body-sm text-primary" role="status">
              {success}
            </p>
          ) : null}

          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Sending…" : "Request callback"}
          </Button>
        </form>
      </div>
    </section>
  );
}
