"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  downloadBulkErrorsCsv,
  getBulkSession,
  importBulkSession,
  parseCsvToRecords,
  validateBulkProperties,
  type BulkSession,
} from "@/lib/api";
import { AppError } from "@/lib/api";
import { Button } from "@/components/ui";

type Tab = "errors" | "warnings" | "all";

export function BulkUploadPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<BulkSession | null>(null);
  const [tab, setTab] = useState<Tab>("errors");
  const [imported, setImported] = useState(false);

  const runValidate = useCallback(async (file: File) => {
    setBusy(true);
    setError(null);
    setImported(false);
    setSession(null);
    try {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        throw new Error("Only .CSV is supported in this build. Export Excel as CSV first.");
      }
      const text = await file.text();
      const records = parseCsvToRecords(text);
      if (records.length === 0) {
        throw new Error("No data rows found in CSV.");
      }
      setFileName(file.name);
      const result = await validateBulkProperties({ records, fileName: file.name });
      const detail = await getBulkSession(result.sessionId);
      setSession(detail);
      setTab(detail.errorCount > 0 ? "errors" : "all");
    } catch (err) {
      setError(err instanceof AppError || err instanceof Error ? err.message : "Validation failed");
    } finally {
      setBusy(false);
    }
  }, []);

  async function onImport() {
    if (!session || session.validCount < 1) return;
    setBusy(true);
    setError(null);
    try {
      const next = await importBulkSession(session.id);
      setSession(next);
      setImported(true);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDownloadErrors() {
    if (!session) return;
    setBusy(true);
    try {
      const blob = await downloadBulkErrorsCsv(session.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bulk-errors-${session.id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Download failed");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFileName(null);
    setSession(null);
    setError(null);
    setImported(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const issues =
    session?.errors.filter((e) => {
      if (tab === "errors") return e.severity === "error";
      if (tab === "warnings") return e.severity === "warning";
      return true;
    }) ?? [];

  return (
    <main className="mx-auto max-w-4xl px-md py-xl md:px-xl">
      <div className="mb-lg flex items-center justify-between gap-md">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary" aria-hidden>
            cloud_upload
          </span>
          <h1 className="font-headline-md text-headline-md text-on-surface">
            Bulk Property Upload
          </h1>
        </div>
        <Link href="/properties" className="font-label-md text-primary hover:underline">
          Back to inventory
        </Link>
      </div>

      <section className="rounded-[10px] border border-outline-variant bg-surface-container-lowest shadow-[0px_12px_24px_rgba(0,0,0,0.06)]">
        <div className="space-y-xl p-lg">
          <div>
            <div className="mb-sm flex items-center gap-xs">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
                1
              </span>
              <h2 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                Upload CSV Source
              </h2>
            </div>
            <label
              className="upload-dashed flex cursor-pointer flex-col items-center justify-center rounded-xl bg-surface-container-low p-xl transition-colors hover:bg-surface-container"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='10' ry='10' stroke='%230052CC' stroke-width='2' stroke-dasharray='8%2c 8' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")",
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) void runValidate(file);
              }}
            >
              <div className="mb-md flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/10">
                <span className="material-symbols-outlined text-[40px] text-primary" aria-hidden>
                  upload_file
                </span>
              </div>
              <p className="font-body-md mb-xs text-on-surface">
                Drag and drop your property list here
              </p>
              <p className="font-label-sm text-outline">
                Supported formats: .CSV (Max 50MB). Required columns: title, price, propertyType,
                bedrooms, bathrooms, areaSqFt, addressLine
              </p>
              <Button
                type="button"
                variant="secondary"
                className="mt-lg"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
              >
                Select Files
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void runValidate(file);
                }}
              />
            </label>
            {fileName ? (
              <div className="mt-md flex items-center gap-sm rounded-lg bg-surface-container-high/50 p-sm">
                <span className="material-symbols-outlined text-primary" aria-hidden>
                  info
                </span>
                <p className="text-body-sm text-on-surface-variant">
                  Uploaded: <span className="font-semibold text-on-surface">{fileName}</span>
                </p>
              </div>
            ) : null}
          </div>

          {session ? (
            <div>
              <div className="mb-sm flex flex-wrap items-center justify-between gap-md">
                <div className="flex items-center gap-xs">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
                    2
                  </span>
                  <h2 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                    Validation Status
                  </h2>
                </div>
                <div className="flex flex-wrap gap-md text-body-sm text-on-surface-variant">
                  <span className="flex items-center gap-xs">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    {session.validCount} Valid
                  </span>
                  <span className="flex items-center gap-xs">
                    <span className="h-2 w-2 rounded-full bg-error" />
                    {session.errorCount} Errors
                  </span>
                  <span className="flex items-center gap-xs">
                    <span className="h-2 w-2 rounded-full bg-secondary" />
                    {session.warningCount} Warnings
                  </span>
                  <span>{session.totalRows} Total</span>
                </div>
              </div>

              <div className="mb-sm flex gap-sm">
                {(
                  [
                    ["errors", "Errors"],
                    ["warnings", "Warnings"],
                    ["all", "All issues"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`rounded-lg px-md py-xs font-label-md ${
                      tab === id
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-low text-on-surface-variant"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="overflow-hidden rounded-lg border border-outline-variant bg-white">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-surface-container-low">
                    <tr>
                      <th className="w-20 border-b border-outline-variant px-md py-sm font-label-md text-on-surface-variant">
                        Row #
                      </th>
                      <th className="w-24 border-b border-outline-variant px-md py-sm text-center font-label-md text-on-surface-variant">
                        Status
                      </th>
                      <th className="border-b border-outline-variant px-md py-sm font-label-md text-on-surface-variant">
                        Message
                      </th>
                      <th className="border-b border-outline-variant px-md py-sm font-label-md text-on-surface-variant">
                        Field
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-body-sm">
                    {issues.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-md py-lg text-on-surface-variant italic">
                          No issues in this view.
                        </td>
                      </tr>
                    ) : (
                      issues.slice(0, 50).map((issue, idx) => (
                        <tr
                          key={`${issue.rowNumber}-${issue.fieldName}-${idx}`}
                          className={`border-b border-outline-variant ${
                            issue.severity === "error" ? "bg-error-container/10" : ""
                          }`}
                        >
                          <td className="px-md py-sm font-semibold text-on-surface">
                            {issue.rowNumber}
                          </td>
                          <td className="px-md py-sm text-center">
                            <span
                              className={`material-symbols-outlined text-[20px] ${
                                issue.severity === "error" ? "text-error" : "text-secondary"
                              }`}
                              aria-hidden
                            >
                              {issue.severity === "error" ? "error" : "warning"}
                            </span>
                          </td>
                          <td
                            className={`px-md py-sm font-medium ${
                              issue.severity === "error" ? "text-error" : "text-on-surface"
                            }`}
                          >
                            {issue.message}
                            {issue.suggestion ? (
                              <span className="mt-xs block font-normal text-on-surface-variant">
                                Suggested: {issue.suggestion}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-md py-sm text-on-surface-variant">
                            {issue.fieldName ?? "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {issues.length > 50 ? (
                <p className="mt-sm text-center font-label-md text-primary">
                  Showing first 50 of {issues.length} issues — download the error report for full list
                </p>
              ) : null}
            </div>
          ) : null}

          {error ? <p className="text-body-md text-error">{error}</p> : null}
          {imported ? (
            <p className="text-body-md text-primary">
              Import complete.{" "}
              <Link href="/properties" className="underline">
                View inventory
              </Link>
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-md border-t border-outline-variant bg-surface-container-low px-lg py-lg">
          <Button variant="ghost" disabled={busy} onClick={reset}>
            {session ? "Fix & re-upload" : "Cancel"}
          </Button>
          {session ? (
            <Button variant="secondary" disabled={busy} onClick={() => void onDownloadErrors()}>
              Download error report
            </Button>
          ) : null}
          <Button
            variant="primary"
            disabled={busy || !session || session.validCount < 1 || session.status === "imported"}
            onClick={() => void onImport()}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden>
              done_all
            </span>
            Commit {session?.validCount ?? 0} Valid Rows
          </Button>
        </div>
      </section>
    </main>
  );
}
