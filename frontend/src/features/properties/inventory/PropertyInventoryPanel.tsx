"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Input, Modal } from "@/components/ui";
import { EmptyState, ErrorState, Loader } from "@/components/states";
import { getCurrentUser } from "@/lib/auth";
import {
  archiveProperty,
  bulkUpdatePropertyStatus,
  createProperty,
  deleteProperty,
  duplicateProperty,
  exportPropertiesCsv,
  listProperties,
  type Property,
  type PropertyStatus,
} from "@/lib/api/properties";
import { AppError } from "@/types/api";

const STATUS_TABS: Array<{ key: PropertyStatus | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "published", label: "Published" },
  { key: "archived", label: "Archived" },
  { key: "sold", label: "Sold" },
  { key: "rented", label: "Rented" },
];

const ALL_COLUMNS = [
  { id: "property", label: "Property" },
  { id: "status", label: "Status" },
  { id: "price", label: "Price" },
  { id: "rooms", label: "Rooms" },
  { id: "updated", label: "Last Updated" },
] as const;

type ColumnId = (typeof ALL_COLUMNS)[number]["id"];

function statusBadgeClass(status: PropertyStatus): string {
  switch (status) {
    case "published":
      return "bg-primary/10 text-primary";
    case "draft":
      return "bg-surface-container-high text-on-surface-variant";
    case "archived":
      return "bg-outline-variant/40 text-on-surface-variant";
    case "sold":
      return "bg-secondary/15 text-secondary";
    case "rented":
      return "bg-ai-accent/15 text-ai-accent";
    default:
      return "bg-surface-container-high text-on-surface-variant";
  }
}

function formatPrice(price: string, currency: string): string {
  const n = Number(price);
  if (Number.isNaN(n)) return `${currency} ${price}`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function PropertyInventoryPanel() {
  const actor = getCurrentUser();
  const canBulk = actor?.role === "admin" || actor?.role === "super_admin";

  const [tab, setTab] = useState<PropertyStatus | "all">("all");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"updatedAt" | "price" | "title" | "status">("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [rows, setRows] = useState<Property[]>([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visibleCols, setVisibleCols] = useState<Set<ColumnId>>(
    () => new Set(ALL_COLUMNS.map((c) => c.id)),
  );
  const [colsOpen, setColsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [propertyType, setPropertyType] = useState("Apartment");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listProperties({
        page,
        pageSize: 20,
        status: tab === "all" ? undefined : tab,
        q: search || undefined,
        sortBy,
        sortOrder,
      });
      setRows(res.data);
      setMeta(res.meta);
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Failed to load properties");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, tab, search, sortBy, sortOrder]);

  useEffect(() => {
    void load();
  }, [load]);

  const allSelected = useMemo(
    () => rows.length > 0 && rows.every((r) => selected.has(r.id)),
    [rows, selected],
  );

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onRowAction(
    id: string,
    action: "archive" | "duplicate" | "delete",
  ) {
    setBusyId(id);
    try {
      if (action === "archive") await archiveProperty(id);
      if (action === "duplicate") await duplicateProperty(id);
      if (action === "delete") await deleteProperty(id);
      await load();
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  async function onBulkStatus(status: PropertyStatus) {
    if (!canBulk || selected.size === 0) return;
    try {
      await bulkUpdatePropertyStatus([...selected], status);
      await load();
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Bulk update failed");
    }
  }

  async function onExport() {
    try {
      const blob = await exportPropertiesCsv({
        status: tab === "all" ? undefined : tab,
        q: search || undefined,
        sortBy,
        sortOrder,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "properties.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Export failed");
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    try {
      await createProperty({
        title: title.trim(),
        price: price.trim(),
        propertyType: propertyType.trim(),
        addressLine: addressLine.trim(),
        city: city.trim() || undefined,
        status: "draft",
      });
      setCreateOpen(false);
      setTitle("");
      setPrice("");
      setAddressLine("");
      setCity("");
      await load();
    } catch (err) {
      setFormError(err instanceof AppError ? err.message : "Create failed");
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-surface-container-low">
        <header className="flex h-16 items-center justify-between gap-md border-b border-outline-variant bg-surface-container-lowest px-lg">
          <div className="relative max-w-xl flex-1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                setSearch(q.trim());
              }}
            >
              <Input
                name="q"
                placeholder="Search properties…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </form>
          </div>
          <div className="flex flex-wrap items-center gap-sm">
            <Button variant="secondary" onClick={() => void onExport()}>
              Export CSV
            </Button>
            {canBulk ? (
              <Link
                href="/properties/bulk"
                className="inline-flex items-center rounded-lg border border-outline-variant px-md py-sm font-label-md text-on-surface hover:bg-surface-container-high"
              >
                Bulk Upload
              </Link>
            ) : null}
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              Add Property
            </Button>
          </div>
        </header>

        <div className="flex flex-col gap-md px-xl pb-md pt-lg">
          <div className="flex items-center justify-between gap-md">
            <h2 className="font-headline-md text-headline-md text-on-surface">Properties</h2>
            <div className="relative">
              <Button variant="ghost" onClick={() => setColsOpen((v) => !v)}>
                Columns
              </Button>
              {colsOpen ? (
                <div className="absolute right-0 z-20 mt-xs w-48 rounded-lg border border-outline-variant bg-surface-container-lowest p-sm shadow-[var(--pv-shadow-level-2)]">
                  {ALL_COLUMNS.map((col) => (
                    <label key={col.id} className="flex items-center gap-sm py-xs text-body-sm">
                      <input
                        type="checkbox"
                        checked={visibleCols.has(col.id)}
                        onChange={() => {
                          setVisibleCols((prev) => {
                            const next = new Set(prev);
                            if (next.has(col.id)) {
                              if (next.size > 1) next.delete(col.id);
                            } else next.add(col.id);
                            return next;
                          });
                        }}
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex gap-lg overflow-x-auto border-b border-outline-variant/30">
            {STATUS_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={[
                  "whitespace-nowrap pb-sm px-xs font-label-md border-b-2 transition-colors",
                  tab === t.key
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface",
                ].join(" ")}
                onClick={() => {
                  setTab(t.key);
                  setPage(1);
                }}
              >
                {t.label}
                {t.key === "all" ? ` (${meta.total})` : ""}
              </button>
            ))}
          </div>
        </div>

        {selected.size > 0 ? (
          <div className="mx-xl mb-md flex flex-wrap items-center gap-sm rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm">
            <span className="text-body-sm text-on-surface-variant">{selected.size} selected</span>
            {canBulk ? (
              <>
                <Button variant="secondary" onClick={() => void onBulkStatus("published")}>
                  Mark published
                </Button>
                <Button variant="secondary" onClick={() => void onBulkStatus("archived")}>
                  Archive
                </Button>
              </>
            ) : null}
            <Button variant="ghost" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        ) : null}

        <div className="flex-grow overflow-y-auto px-xl pb-xl">
          {loading ? <Loader /> : null}
          {error ? <ErrorState message={error} /> : null}
          {!loading && !error && rows.length === 0 ? (
            <EmptyState
              title="No properties found"
              description="Create a listing or adjust filters to see inventory."
              action={
                <Button variant="primary" onClick={() => setCreateOpen(true)}>
                  Add Property
                </Button>
              }
            />
          ) : null}

          {!loading && rows.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[var(--pv-shadow-level-1)]">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    <th className="w-12 px-lg py-md">
                      <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                    </th>
                    {visibleCols.has("property") ? (
                      <th className="px-lg py-md font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                        <button
                          type="button"
                          className="hover:text-primary"
                          onClick={() => {
                            setSortBy("title");
                            setSortOrder((o) => (sortBy === "title" && o === "asc" ? "desc" : "asc"));
                          }}
                        >
                          Property
                        </button>
                      </th>
                    ) : null}
                    {visibleCols.has("status") ? (
                      <th className="px-lg py-md font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                        Status
                      </th>
                    ) : null}
                    {visibleCols.has("price") ? (
                      <th className="px-lg py-md font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                        <button
                          type="button"
                          className="hover:text-primary"
                          onClick={() => {
                            setSortBy("price");
                            setSortOrder((o) => (sortBy === "price" && o === "asc" ? "desc" : "asc"));
                          }}
                        >
                          Price
                        </button>
                      </th>
                    ) : null}
                    {visibleCols.has("rooms") ? (
                      <th className="px-lg py-md font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                        Rooms
                      </th>
                    ) : null}
                    {visibleCols.has("updated") ? (
                      <th className="px-lg py-md font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                        Last Updated
                      </th>
                    ) : null}
                    <th className="px-lg py-md text-right font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-outline-variant/30 transition-colors hover:bg-surface-container-lowest"
                    >
                      <td className="px-lg py-md">
                        <input
                          type="checkbox"
                          checked={selected.has(p.id)}
                          onChange={() => toggleOne(p.id)}
                        />
                      </td>
                      {visibleCols.has("property") ? (
                        <td className="px-lg py-md">
                          <div className="font-label-md text-on-surface">{p.title}</div>
                          <div className="text-body-sm text-on-surface-variant">
                            {p.propertyType}
                            {p.address.city ? ` · ${p.address.city}` : ""}
                          </div>
                        </td>
                      ) : null}
                      {visibleCols.has("status") ? (
                        <td className="px-lg py-md">
                          <span
                            className={`rounded-md px-sm py-xs font-label-sm capitalize ${statusBadgeClass(p.status)}`}
                          >
                            {p.status}
                          </span>
                        </td>
                      ) : null}
                      {visibleCols.has("price") ? (
                        <td className="px-lg py-md font-label-md">
                          {formatPrice(p.price, p.currency)}
                        </td>
                      ) : null}
                      {visibleCols.has("rooms") ? (
                        <td className="px-lg py-md text-body-sm text-on-surface-variant">
                          {p.bedrooms} bd · {p.bathrooms} ba · {p.areaSqFt} sqft
                        </td>
                      ) : null}
                      {visibleCols.has("updated") ? (
                        <td className="px-lg py-md text-body-sm text-on-surface-variant">
                          {new Date(p.updatedAt).toLocaleDateString()}
                        </td>
                      ) : null}
                      <td className="px-lg py-md">
                        <div className="flex flex-wrap justify-end gap-xs">
                          <Link href={`/properties/${p.id}/edit`}>
                            <Button variant="ghost">Edit</Button>
                          </Link>
                          <Button
                            variant="ghost"
                            disabled={busyId === p.id}
                            onClick={() => void onRowAction(p.id, "duplicate")}
                          >
                            Duplicate
                          </Button>
                          <Button
                            variant="ghost"
                            disabled={busyId === p.id}
                            onClick={() => void onRowAction(p.id, "archive")}
                          >
                            Archive
                          </Button>
                          <Button
                            variant="ghost"
                            disabled={busyId === p.id}
                            onClick={() => void onRowAction(p.id, "delete")}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {meta.totalPages > 1 ? (
            <div className="mt-md flex items-center gap-sm">
              <Button
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-body-sm text-on-surface-variant">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>

      <Modal
        open={createOpen}
        title="Add Property"
        onClose={() => setCreateOpen(false)}
        footer={
          <div className="flex justify-end gap-sm">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" form="create-property" type="submit">
              Create draft
            </Button>
          </div>
        }
      >
        <form id="create-property" className="flex flex-col gap-md" onSubmit={(e) => void onCreate(e)}>
          <Input label="Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label="Price" name="price" value={price} onChange={(e) => setPrice(e.target.value)} required />
          <Input
            label="Type"
            name="propertyType"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            required
          />
          <Input
            label="Address"
            name="addressLine"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            required
          />
          <Input label="City" name="city" value={city} onChange={(e) => setCity(e.target.value)} />
          {formError ? <p className="text-body-sm text-error">{formError}</p> : null}
        </form>
      </Modal>
    </div>
  );
}
