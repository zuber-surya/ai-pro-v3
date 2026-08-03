"use client";

import { useState } from "react";
import {
  AppError,
  updateCustomerProfile,
  type CustomerProfile,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export function RequirementProfileEditor({
  profile,
  onSaved,
}: {
  profile: CustomerProfile;
  onSaved: (next: CustomerProfile) => void;
}) {
  const [open, setOpen] = useState(false);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [bedsMin, setBedsMin] = useState("");
  const [types, setTypes] = useState("");
  const [locations, setLocations] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openEditor() {
    setBudgetMin(profile.preferences.budgetMin ?? "");
    setBudgetMax(profile.preferences.budgetMax ?? "");
    setBedsMin(profile.preferences.bedsMin != null ? String(profile.preferences.bedsMin) : "");
    setTypes(profile.preferences.propertyTypes.join(", "));
    setLocations(profile.preferences.locations.join(", "));
    setError(null);
    setOpen(true);
  }

  async function save() {
    setSubmitting(true);
    setError(null);
    try {
      const next = await updateCustomerProfile({
        preferences: {
          budgetMin: budgetMin.trim() || null,
          budgetMax: budgetMax.trim() || null,
          bedsMin: bedsMin.trim() ? Number(bedsMin) : null,
          propertyTypes: types
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          locations: locations
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
      });
      onSaved(next);
      setOpen(false);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Could not save profile.");
    } finally {
      setSubmitting(false);
    }
  }

  const prefs = profile.preferences;
  const budgetLabel =
    prefs.budgetMin || prefs.budgetMax
      ? `₹${prefs.budgetMin ?? "—"} – ₹${prefs.budgetMax ?? "—"}`
      : "Not set";
  const locationLabel = prefs.locations.length ? prefs.locations.join(", ") : "Not set";
  const typeLabel = prefs.propertyTypes.length ? prefs.propertyTypes.join(", ") : "Not set";

  return (
    <>
      <section
        id="requirements"
        className="level-1-card rounded-xl border border-outline-variant/30 bg-surface-container-low p-lg shadow-[0px_2px_4px_rgba(0,0,0,0.05)] md:col-span-4"
      >
        <div className="mb-md flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined" aria-hidden>
            person_search
          </span>
          <h3 className="font-label-md text-label-md uppercase tracking-wider">
            Requirement Profile
          </h3>
        </div>
        <div className="space-y-md">
          <div>
            <label className="mb-1 block font-label-sm text-on-surface-variant">Budget</label>
            <p className="font-headline-md text-headline-md text-on-surface">{budgetLabel}</p>
          </div>
          <div className="h-px w-full bg-outline-variant/50" />
          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="mb-1 block font-label-sm text-on-surface-variant">Location</label>
              <p className="font-body-md font-medium text-on-surface">{locationLabel}</p>
            </div>
            <div>
              <label className="mb-1 block font-label-sm text-on-surface-variant">Type</label>
              <p className="font-body-md font-medium text-on-surface">{typeLabel}</p>
            </div>
          </div>
          <p className="font-body-sm text-on-surface-variant">
            Completion: {prefs.completionPct}%
            {prefs.bedsMin != null ? ` · ${prefs.bedsMin}+ beds` : ""}
          </p>
        </div>
        <div className="mt-lg border-t border-outline-variant/50 pt-lg">
          <button
            type="button"
            onClick={openEditor}
            className="flex items-center gap-1 font-label-md font-bold text-primary hover:underline"
          >
            Edit Profile
            <span className="material-symbols-outlined text-[18px]" aria-hidden>
              chevron_right
            </span>
          </button>
        </div>
      </section>

      <Modal
        open={open}
        title="Edit requirement profile"
        onClose={() => !submitting && setOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" disabled={submitting} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" disabled={submitting} onClick={() => void save()}>
              {submitting ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        <div className="space-y-md">
          <Input label="Budget min (INR)" name="budgetMin" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
          <Input label="Budget max (INR)" name="budgetMax" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
          <Input label="Min bedrooms" name="bedsMin" value={bedsMin} onChange={(e) => setBedsMin(e.target.value)} />
          <Input
            label="Property types (comma-separated)"
            name="types"
            value={types}
            onChange={(e) => setTypes(e.target.value)}
            placeholder="Apartment, Villa"
          />
          <Input
            label="Locations (comma-separated)"
            name="locations"
            value={locations}
            onChange={(e) => setLocations(e.target.value)}
            placeholder="Bengaluru, Indiranagar"
          />
          {error ? (
            <p className="text-body-sm text-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </Modal>
    </>
  );
}
