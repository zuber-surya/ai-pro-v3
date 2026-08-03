"use client";

import { RequireRole } from "@/lib/auth";
import { NotificationRulesPanel } from "@/features/admin/notificationRules";

export default function AdminNotificationRulesPage() {
  return (
    <RequireRole roles={["admin", "super_admin"]}>
      <main className="mx-auto max-w-container-max px-md py-xl md:px-xl">
        <NotificationRulesPanel />
      </main>
    </RequireRole>
  );
}
