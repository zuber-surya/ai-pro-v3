"use client";

import { RequireRole } from "@/lib/auth";
import { AiConfigPanel } from "@/features/ai/config";

export default function AdminAiConfigPage() {
  return (
    <RequireRole roles={["admin", "super_admin"]}>
      <main className="mx-auto max-w-container-max px-md py-xl md:px-xl">
        <AiConfigPanel />
      </main>
    </RequireRole>
  );
}
