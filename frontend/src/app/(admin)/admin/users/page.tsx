"use client";

import { RequireRole } from "@/lib/auth";
import { UsersAdminPanel } from "@/features/admin/users";

export default function AdminUsersPage() {
  return (
    <RequireRole roles={["admin", "super_admin"]}>
      <main className="mx-auto max-w-container-max px-md py-xl md:px-xl">
        <UsersAdminPanel />
      </main>
    </RequireRole>
  );
}
