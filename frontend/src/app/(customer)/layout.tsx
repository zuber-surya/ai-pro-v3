"use client";

import type { ReactNode } from "react";
import { RequireRole } from "@/lib/auth";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return <RequireRole roles={["customer"]}>{children}</RequireRole>;
}
