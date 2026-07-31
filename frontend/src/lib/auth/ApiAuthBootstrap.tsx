"use client";

import { useEffect, useState, type ReactNode } from "react";
import { configureApiAuth } from "@/lib/api";
import { getMe } from "@/lib/api/auth";
import {
  getAccessToken,
  getRefreshToken,
  hydrateAuthTokensFromStorage,
  refreshAccessToken,
  setCurrentUser,
} from "@/lib/auth/session";

/** Boots API auth shell + hydrates session user when tokens exist. */
export function ApiAuthBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    hydrateAuthTokensFromStorage();
    configureApiAuth({
      getAccessToken,
      refreshAccessToken,
    });

    async function hydrateUser() {
      if (!getAccessToken() && !getRefreshToken()) {
        setCurrentUser(null);
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const user = await getMe();
        if (!cancelled) setCurrentUser(user);
      } catch {
        if (!cancelled) setCurrentUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void hydrateUser();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-body-md text-on-surface-variant">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
