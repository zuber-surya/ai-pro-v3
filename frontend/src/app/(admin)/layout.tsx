"use client";

import type { ReactNode } from "react";
import { RequireRole } from "@/lib/auth";
import { AdminShell } from "@/features/admin/shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole roles={["agent", "admin", "super_admin"]}>
      <AdminShell>{children}</AdminShell>
    </RequireRole>
  );
}
