"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button, Input } from "@/components/ui";
import { EmptyState, ErrorState, Loader } from "@/components/states";
import {
  AppError,
  createCmsPage,
  listCmsPages,
  updateCmsPage,
  type CmsPage,
  type CmsPageStatus,
} from "@/lib/api";

function sectionsToEditor(page: CmsPage): string {
  return JSON.stringify(page.sections ?? {}, null, 2);
}

export function CmsAdminPanel() {
  const [rows, setRows] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<CmsPageStatus>("draft");
  const [sectionsJson, setSectionsJson] = useState("{}");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const applyPage = useCallback((page: CmsPage) => {
    setCreating(false);
    setSelectedId(page.id);
    setTitle(page.title);
    setSlug(page.slug);
    setStatus(page.status);
    setSectionsJson(sectionsToEditor(page));
    setFormError(null);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listCmsPages({ page: 1, pageSize: 50 });
      setRows(res.data);
      const homepage = res.data.find((p) => p.slug === "homepage") ?? res.data[0];
      if (homepage) applyPage(homepage);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Failed to load CMS pages");
    } finally {
      setLoading(false);
    }
  }, [applyPage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  function startCreate() {
    setCreating(true);
    setSelectedId(null);
    setTitle("");
    setSlug("");
    setStatus("draft");
    setSectionsJson('{\n  "html": "<p>New page content</p>"\n}');
    setFormError(null);
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    let sections: Record<string, unknown>;
    try {
      sections = JSON.parse(sectionsJson) as Record<string, unknown>;
      if (!sections || typeof sections !== "object" || Array.isArray(sections)) {
        throw new Error("Sections must be a JSON object");
      }
    } catch {
      setFormError("Sections JSON is invalid");
      return;
    }

    setSaving(true);
    try {
      if (creating) {
        const created = await createCmsPage({
          slug: slug.trim(),
          title: title.trim(),
          sections,
          status,
        });
        setToast("Page created");
        applyPage(created);
        const res = await listCmsPages({ page: 1, pageSize: 50 });
        setRows(res.data);
      } else if (selectedId) {
        const updated = await updateCmsPage(selectedId, {
          title: title.trim(),
          sections,
          status,
        });
        setToast("Page saved");
        setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        applyPage(updated);
      }
    } catch (err) {
      setFormError(err instanceof AppError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading && rows.length === 0) {
    return (
      <div className="py-xl">
        <Loader label="Loading CMS…" />
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
          <h1 className="font-headline-lg text-headline-lg text-on-surface">CMS Pages</h1>
          <p className="text-body-md text-on-surface-variant">
            Edit homepage blocks and published content pages. Drafts stay private.
          </p>
        </div>
        <Button type="button" variant="primary" onClick={startCreate}>
          New page
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-lg lg:grid-cols-12">
        <aside className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md lg:col-span-4">
          <h2 className="mb-md font-label-md font-bold text-on-surface-variant">Pages</h2>
          {rows.length === 0 ? (
            <EmptyState title="No pages" description="Create a CMS page to get started." />
          ) : (
            <ul className="space-y-xs">
              {rows.map((page) => (
                <li key={page.id}>
                  <button
                    type="button"
                    onClick={() => applyPage(page)}
                    className={[
                      "flex w-full items-center justify-between rounded-lg px-md py-sm text-left",
                      selectedId === page.id && !creating
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-surface-container-low",
                    ].join(" ")}
                  >
                    <span>
                      <span className="block font-label-md font-bold">{page.title}</span>
                      <span className="text-body-sm text-on-surface-variant">/{page.slug}</span>
                    </span>
                    <span className="font-label-sm uppercase text-on-surface-variant">
                      {page.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <form
          onSubmit={onSave}
          className="space-y-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg lg:col-span-8"
        >
          <h2 className="font-headline-md text-headline-md">
            {creating ? "New page" : selectedId ? "Edit page" : "Select a page"}
          </h2>
          {!creating && !selectedId ? (
            <p className="text-body-md text-on-surface-variant">Choose a page from the list.</p>
          ) : (
            <>
              <Input
                label="Title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Input
                label="Slug"
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                disabled={!creating}
              />
              <label className="flex flex-col gap-xs">
                <span className="font-label-md text-on-surface">Status</span>
                <select
                  className="rounded-lg border border-outline-variant px-md py-sm text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CmsPageStatus)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label className="flex flex-col gap-xs">
                <span className="font-label-md text-on-surface">
                  Sections JSON{" "}
                  {slug === "homepage" ? "(hero, featured, journey, testimonials)" : ""}
                </span>
                <textarea
                  className="min-h-[320px] w-full rounded-lg border border-outline-variant p-md font-mono text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={sectionsJson}
                  onChange={(e) => setSectionsJson(e.target.value)}
                  spellCheck={false}
                />
              </label>
              {formError ? (
                <p className="text-body-sm text-error" role="alert">
                  {formError}
                </p>
              ) : null}
              <div className="flex justify-end gap-sm">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>

      {toast ? (
        <div
          className="fixed bottom-lg right-lg z-[100] rounded-lg bg-inverse-surface px-lg py-md font-label-md text-inverse-on-surface"
          role="status"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
