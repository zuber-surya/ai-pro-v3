"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppError, createSavedSearch } from "@/lib/api";
import { getAccessToken, getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import type { SearchUiFilters } from "./SearchFiltersPanel";

export function SaveSearchButton({
  query,
  mode,
  filters,
}: {
  query: string;
  mode: "ai" | "fallback";
  filters: SearchUiFilters;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function openModal() {
    const user = getCurrentUser();
    if (!getAccessToken() || !user) {
      router.push(`/login?next=${encodeURIComponent("/search")}`);
      return;
    }
    if (user.role !== "customer") {
      setSuccess(null);
      setError("Sign in as a customer to save searches.");
      return;
    }
    setName(query.trim() ? query.trim().slice(0, 80) : "My search");
    setError(null);
    setSuccess(null);
    setOpen(true);
  }

  async function onSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const filterPayload: Record<string, unknown> = {};
      if (filters.minPrice.trim()) filterPayload.minPrice = filters.minPrice.trim();
      if (filters.maxPrice.trim()) filterPayload.maxPrice = filters.maxPrice.trim();
      if (filters.bedrooms != null) filterPayload.bedrooms = filters.bedrooms;
      if (filters.amenities.length) filterPayload.amenities = filters.amenities;
      if (filters.propertyTypes.length === 1) {
        filterPayload.propertyType = filters.propertyTypes[0];
      } else if (filters.propertyTypes.length > 1) {
        filterPayload.propertyTypes = filters.propertyTypes;
      }

      await createSavedSearch({
        name: trimmed,
        criteria: {
          query: query.trim(),
          mode,
          filters: filterPayload,
        },
      });
      setSuccess("Search saved.");
      setOpen(false);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Could not save search.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-xs rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-2 font-label-md text-on-surface hover:border-primary/40"
        aria-label="Save this search"
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden>
          bookmark
        </span>
        Save search
      </button>
      {error && !open ? (
        <p className="text-body-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
      {success && !open ? (
        <p className="text-body-sm text-primary" role="status">
          {success}
        </p>
      ) : null}

      <Modal
        open={open}
        title="Save search"
        onClose={() => !submitting && setOpen(false)}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              disabled={submitting}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="primary" disabled={submitting} onClick={() => void onSave()}>
              {submitting ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        <div className="space-y-md">
          <Input
            label="Name"
            name="savedSearchName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <p className="text-body-sm text-on-surface-variant">
            Query: <span className="text-on-surface">{query.trim() || "(empty)"}</span>
            {mode === "fallback" ? " · fallback mode" : ""}
          </p>
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
