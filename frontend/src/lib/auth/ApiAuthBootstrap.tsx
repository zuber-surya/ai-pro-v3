"use client";

import { useEffect, type ReactNode } from "react";
import { configureApiAuth } from "@/lib/api";
import { getAccessToken, hydrateAuthTokensFromStorage, refreshAccessTokenStub } from "@/lib/auth";

/** Boots API auth shell (token getter + refresh stub). */
export function ApiAuthBootstrap({ children }: { children: ReactNode }) {
  useEffect(() => {
    hydrateAuthTokensFromStorage();
    configureApiAuth({
      getAccessToken,
      refreshAccessToken: refreshAccessTokenStub,
    });
  }, []);

  return <>{children}</>;
}
