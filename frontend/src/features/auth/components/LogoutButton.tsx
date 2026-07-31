"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { logout as logoutApi } from "@/lib/api";
import { clearAuthTokens } from "@/lib/auth";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    setBusy(true);
    try {
      await logoutApi();
    } catch {
      /* still clear local session */
    } finally {
      clearAuthTokens();
      setBusy(false);
      router.replace("/login");
    }
  }

  return (
    <Button type="button" variant="ghost" disabled={busy} onClick={() => void onLogout()}>
      {busy ? "Signing out…" : "Sign out"}
    </Button>
  );
}
