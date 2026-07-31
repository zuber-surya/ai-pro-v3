"use client";

import { RequireRole } from "@/lib/auth";
import { AgentsAdminPanel } from "@/features/admin/agents";

export default function AdminAgentsPage() {
  return (
    <RequireRole roles={["admin", "super_admin"]}>
      <main className="mx-auto max-w-container-max px-md py-xl md:px-xl">
        <AgentsAdminPanel />
      </main>
    </RequireRole>
  );
}
