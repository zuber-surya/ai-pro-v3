"use client";

import { useState } from "react";
import { Button, Input, Modal } from "@/components/ui";
import { EmptyState, ErrorState, Loader, Skeleton } from "@/components/states";
import { publicEnv } from "@/lib/config/env";

/** Temporary FEAT-00-02 spot-check surface — replace with SCR-HOME in later sprint. */
export default function HomePage() {
  const [open, setOpen] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen max-w-container-max flex-col gap-xl px-md py-xl md:px-xl">
      <header className="space-y-sm">
        <p className="font-label-md text-label-md text-ai-accent">PropVista CRM</p>
        <h1 className="font-display-lg text-display-lg text-on-surface">
          Design tokens &amp; primitives
        </h1>
        <p className="text-body-md text-on-surface-variant">
          FEAT-00-02 spot-check. API: <code>{publicEnv.apiBaseUrl}</code>
        </p>
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

      <ErrorState message="Sample API failure for QA spot-check." onRetry={() => undefined} />

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
