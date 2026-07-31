"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button, Input, Modal } from "@/components/ui";
import { EmptyState, ErrorState, Loader } from "@/components/states";
import {
  agentImageSrc,
  createAgent,
  listAgents,
  updateAgent,
  uploadAgentImage,
  type Agent,
} from "@/lib/api/agents";
import { AppError } from "@/types/api";

export function AgentsAdminPanel() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Agent[]>([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAgents({ page, pageSize: 20 });
      setRows(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Failed to load agents");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setName("");
    setEmail("");
    setPhone("");
    setImageFile(null);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(agent: Agent) {
    setEditing(agent);
    setName(agent.name);
    setEmail(agent.email);
    setPhone(agent.phone ?? "");
    setImageFile(null);
    setFormError(null);
    setModalOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      let agent: Agent;
      if (editing) {
        agent = await updateAgent(editing.id, {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
        });
      } else {
        agent = await createAgent({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
        });
      }
      if (imageFile) {
        agent = await uploadAgentImage(agent.id, imageFile);
      }
      void agent;
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof AppError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-lg">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Agents</h1>
          <p className="text-body-md text-on-surface-variant">
            Manage agent name, email, phone, and profile image.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          Create agent
        </Button>
      </div>

      {loading ? <Loader /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState title="No agents" description="Create an agent profile for listing cards." />
      ) : null}

      {!loading && rows.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-outline-variant">
          <table className="w-full min-w-[640px] text-left text-body-md">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="px-md py-sm font-label-md">Photo</th>
                <th className="px-md py-sm font-label-md">Name</th>
                <th className="px-md py-sm font-label-md">Email</th>
                <th className="px-md py-sm font-label-md">Phone</th>
                <th className="px-md py-sm font-label-md">Status</th>
                <th className="px-md py-sm font-label-md">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const src = agentImageSrc(a.profileImageUrl);
                return (
                  <tr key={a.id} className="border-b border-outline-variant last:border-0">
                    <td className="px-md py-sm">
                      {src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={src} alt="" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <span className="text-on-surface-variant">—</span>
                      )}
                    </td>
                    <td className="px-md py-sm">{a.name}</td>
                    <td className="px-md py-sm">{a.email}</td>
                    <td className="px-md py-sm">{a.phone ?? "—"}</td>
                    <td className="px-md py-sm">{a.isActive ? "Active" : "Inactive"}</td>
                    <td className="px-md py-sm">
                      <Button variant="ghost" onClick={() => openEdit(a)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {meta.totalPages > 1 ? (
        <div className="flex items-center gap-sm">
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

      <Modal
        open={modalOpen}
        title={editing ? "Edit agent" : "Create agent"}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-sm">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" form="agent-form" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        }
      >
        <form id="agent-form" className="flex flex-col gap-md" onSubmit={(e) => void onSubmit(e)}>
          <Input label="Name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
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
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <label className="flex flex-col gap-xs text-body-sm text-on-surface">
            Profile image (jpeg/png/webp, max 2MB)
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {formError ? <p className="text-body-sm text-error">{formError}</p> : null}
        </form>
      </Modal>
    </div>
  );
}
