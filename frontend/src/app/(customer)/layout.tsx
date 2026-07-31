"use client";

import type { ReactNode } from "react";
import { RequireAuth } from "@/lib/auth";
import { LogoutButton } from "@/features/auth";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="min-h-screen">
        <header className="flex items-center justify-end border-b border-outline-variant px-md py-sm">
          <LogoutButton />
        </header>
        {children}
      </div>
    </RequireAuth>
  );
}
