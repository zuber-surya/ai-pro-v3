"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button, Input, Modal } from "@/components/ui";
import { EmptyState, ErrorState, Loader } from "@/components/states";
import { createUser, listUsers, updateUser } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { AppError, type UserPublic, type UserRole } from "@/types/api";

const ALL_ASSIGNABLE: UserRole[] = ["customer", "agent", "admin", "super_admin"];

function roleOptionsForActor(actorRole: UserRole | null): UserRole[] {
  if (actorRole === "super_admin") return ALL_ASSIGNABLE;
  return ["customer", "agent"];
}

export function UsersAdminPanel() {
  const actor = getCurrentUser();
  const roleChoices = roleOptionsForActor(actor?.role ?? null);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<UserPublic[]>([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserPublic | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [isActive, setIsActive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listUsers({ page, pageSize: 20 });
      setRows(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Failed to load users");
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
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setRole("customer");
    setIsActive(true);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(user: UserPublic) {
    setEditing(user);
    setEmail(user.email);
    setPassword("");
    setFullName(user.fullName ?? "");
    setPhone(user.phone ?? "");
    setRole(user.role);
    setIsActive(user.isActive);
    setFormError(null);
    setModalOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      if (editing) {
        const payload: Parameters<typeof updateUser>[1] = {
          fullName: fullName.trim() || undefined,
          phone: phone.trim() || null,
          isActive,
        };
        if (role !== editing.role) {
          payload.role = role;
        }
        await updateUser(editing.id, payload);
      } else {
        if (password.length < 8) {
          setFormError("Password must be at least 8 characters");
          setSaving(false);
          return;
        }
        await createUser({
          email: email.trim(),
          password,
          role,
          fullName: fullName.trim() || undefined,
          phone: phone.trim() || undefined,
        });
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof AppError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(user: UserPublic) {
    try {
      await updateUser(user.id, { isActive: !user.isActive });
      await load();
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Update failed");
    }
  }

  return (
    <div className="space-y-lg">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Users</h1>
          <p className="text-body-md text-on-surface-variant">
            Manage accounts. Assignable roles: customer, agent
            {actor?.role === "super_admin" ? ", admin, super_admin" : ""}. Guest is unauthenticated
            only.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          Create user
        </Button>
      </div>

      {loading ? <Loader /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState title="No users" description="Create the first user to get started." />
      ) : null}

      {!loading && rows.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-outline-variant">
          <table className="w-full min-w-[640px] text-left text-body-md">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="px-md py-sm font-label-md">Email</th>
                <th className="px-md py-sm font-label-md">Name</th>
                <th className="px-md py-sm font-label-md">Role</th>
                <th className="px-md py-sm font-label-md">Status</th>
                <th className="px-md py-sm font-label-md">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b border-outline-variant last:border-0">
                  <td className="px-md py-sm">{u.email}</td>
                  <td className="px-md py-sm">{u.fullName ?? "—"}</td>
                  <td className="px-md py-sm">{u.role}</td>
                  <td className="px-md py-sm">{u.isActive ? "Active" : "Inactive"}</td>
                  <td className="px-md py-sm">
                    <div className="flex flex-wrap gap-xs">
                      <Button variant="ghost" onClick={() => openEdit(u)}>
                        Edit
                      </Button>
                      <Button variant="secondary" onClick={() => void toggleActive(u)}>
                        {u.isActive ? "Deactivate" : "Activate"}
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
        title={editing ? "Edit user" : "Create user"}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-sm">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" form="user-form" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        }
      >
        <form id="user-form" className="flex flex-col gap-md" onSubmit={(e) => void onSubmit(e)}>
          {!editing ? (
            <>
              <Input
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          ) : (
            <p className="text-body-sm text-on-surface-variant">{email}</p>
          )}
          <Input
            label="Full name"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="Phone"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <label className="flex flex-col gap-xs text-body-sm text-on-surface">
            Role
            <select
              className="rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              {roleChoices.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              {editing && !roleChoices.includes(editing.role) ? (
                <option value={editing.role}>{editing.role}</option>
              ) : null}
            </select>
          </label>
          {editing ? (
            <label className="flex items-center gap-sm text-body-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>
          ) : null}
          {formError ? <p className="text-body-sm text-error">{formError}</p> : null}
        </form>
      </Modal>
    </div>
  );
}
