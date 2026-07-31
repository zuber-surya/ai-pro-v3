"use client";

import Link from "next/link";
import { Button } from "@/components/ui";

/** Homepage auth CTAs — Sign In / Join AI Pro */
export function HomeAuthCtas() {
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
