"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { getAccessToken, getCurrentUser, peekAccessRole } from "@/lib/auth/session";

/** Redirect guests to /login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const authed = Boolean(getAccessToken() || getCurrentUser());

  useEffect(() => {
    if (!authed) router.replace("/login");
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

/** Require one of the listed roles; guests → /login; wrong role → /customer. */
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
      router.replace("/login");
      return;
    }
    if (!allowed) router.replace("/customer");
  }, [authed, allowed, router]);

  if (!authed || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center text-body-md text-on-surface-variant">
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}
