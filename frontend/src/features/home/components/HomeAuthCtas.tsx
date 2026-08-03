"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { NotificationsBell } from "@/features/notifications";
import { getAccessToken, getCurrentUser } from "@/lib/auth";

/** Homepage auth CTAs — Sign In / Join AI Pro, or bell when authed */
export function HomeAuthCtas() {
  const authed = Boolean(getAccessToken() || getCurrentUser());
  if (authed) {
    return (
      <div className="flex items-center gap-md">
        <NotificationsBell />
        <Link href="/customer" className="font-label-md text-primary hover:underline">
          Account
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-md">
      <Link
        href="/login"
        className="font-label-md text-on-surface transition-colors hover:text-primary"
      >
        Sign In
      </Link>
      <Link href="/register">
        <Button variant="primary" type="button">
          Join AI Pro
        </Button>
      </Link>
    </div>
  );
}
