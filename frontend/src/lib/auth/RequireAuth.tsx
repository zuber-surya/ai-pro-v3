"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  getAccessToken,
  getCurrentUser,
  homePathForRole,
  peekAccessRole,
} from "@/lib/auth/session";

function loginWithReturnPath() {
  if (typeof window === "undefined") return "/login";
  const next = `${window.location.pathname}${window.location.search}`;
  return `/login?next=${encodeURIComponent(next)}`;
}

/** Redirect guests to /login (preserves return path). */
export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const authed = Boolean(getAccessToken() || getCurrentUser());

  useEffect(() => {
    if (!authed) router.replace(loginWithReturnPath());
  }, [authed, router]);

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center text-body-md text-on-surface-variant">
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}

/** Require one of the listed roles; guests → /login; wrong role → role home. */
export function RequireRole({
  roles,
  children,
}: {
  roles: Array<"customer" | "agent" | "admin" | "super_admin">;
  children: ReactNode;
}) {
  const router = useRouter();
  const user = getCurrentUser();
  const role = user?.role ?? peekAccessRole();
  const authed = Boolean(getAccessToken() || user);
  const allowed = role != null && roles.includes(role);

  useEffect(() => {
    if (!authed) {
      router.replace(loginWithReturnPath());
      return;
    }
    if (!allowed) router.replace(homePathForRole(role));
  }, [authed, allowed, role, router]);

  if (!authed || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center text-body-md text-on-surface-variant">
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}
