"use client";

import type { ReactNode } from "react";
import { RequireRole } from "@/lib/auth";
import { LogoutButton } from "@/features/auth";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole roles={["agent", "admin", "super_admin"]}>
      <div className="min-h-screen">
        <header className="flex items-center justify-end border-b border-outline-variant px-md py-sm">
          <LogoutButton />
        </header>
        {children}
      </div>
    </RequireRole>
  );
}
