"use client";

import { RequireRole } from "@/lib/auth";
import { CmsAdminPanel } from "@/features/cms";

export default function AdminCmsPage() {
  return (
    <RequireRole roles={["admin", "super_admin"]}>
      <main className="mx-auto max-w-container-max px-md py-xl md:px-xl">
        <CmsAdminPanel />
      </main>
    </RequireRole>
  );
}
