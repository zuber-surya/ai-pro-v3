"use client";

import { useEffect, useState } from "react";
import { Button, Input, Modal } from "@/components/ui";
import { EmptyState, ErrorState, Loader, Skeleton } from "@/components/states";
import { HomeAuthCtas } from "@/features/home";
import { getHealth } from "@/lib/api";
import { AppError } from "@/types/api";
import { publicEnv } from "@/lib/config/env";

/** Temporary Sprint 0 surface — FEAT-00-02 primitives + FEAT-00-03 health smoke */
export default function HomePage() {
  const [open, setOpen] = useState(false);
  const [health, setHealth] = useState<string>("checking…");
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getHealth()
      .then((data) => {
        if (!cancelled) {
          setHealth(`${data.status}${data.version ? ` (${data.version})` : ""}`);
          setHealthError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof AppError ? `${err.code}: ${err.message}` : "Health request failed";
          setHealthError(message);
          setHealth("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-container-max flex-col gap-xl px-md py-xl md:px-xl">
      <nav className="flex items-center justify-between border-b border-outline-variant pb-md">
        <p className="font-headline-md text-headline-md font-bold text-primary">PropVista CRM</p>
        <HomeAuthCtas />
      </nav>
      <header className="space-y-sm">
        <p className="font-label-md text-label-md text-ai-accent">PropVista CRM</p>
        <h1 className="font-display-lg text-display-lg text-on-surface">
          Sprint 0 — tokens &amp; API client
        </h1>
        <p className="text-body-md text-on-surface-variant">
          API base: <code>{publicEnv.apiBaseUrl}</code>
        </p>
        <p className="text-body-md text-on-surface">
          Health via <code>lib/api</code>:{" "}
          <strong className={healthError ? "text-error" : "text-primary"}>{health}</strong>
        </p>
        {healthError ? <ErrorState message={healthError} /> : null}
      </header>

      <section className="space-y-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-[var(--pv-shadow-level-1)]">
        <h2 className="font-headline-md text-headline-md">Buttons</h2>
        <div className="flex flex-wrap gap-sm">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="ai">AI Action</Button>
          <Button variant="primary" onClick={() => setOpen(true)}>
            Open modal
          </Button>
        </div>
      </section>

      <section className="space-y-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
        <h2 className="font-headline-md text-headline-md">Input</h2>
        <Input label="Email" name="email" type="email" placeholder="you@example.com" />
        <Input label="With error" name="bad" error="This field is required" defaultValue="" />
      </section>

      <section className="grid gap-lg md:grid-cols-2">
        <div className="rounded-xl border border-outline-variant p-lg">
          <h2 className="mb-md font-headline-md text-headline-md">Loader</h2>
          <Loader />
        </div>
        <div className="rounded-xl border border-outline-variant p-lg">
          <h2 className="mb-md font-headline-md text-headline-md">Skeleton</h2>
          <div className="space-y-sm">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-24 w-full" ai />
          </div>
        </div>
      </section>

      <EmptyState
        showSearchIllustration
        title="No properties found"
        description="Try adjusting filters or search with natural language."
        action={<Button variant="primary">Reset search</Button>}
      />

      <Modal
        open={open}
        title="Sample modal"
        onClose={() => setOpen(false)}
        footer={
          <Button variant="primary" onClick={() => setOpen(false)}>
            Done
          </Button>
        }
      >
        Level-2 elevation dialog shell using design tokens.
      </Modal>
    </main>
  );
}
