import { publicEnv } from "@/lib/config/env";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">PropVista CRM</h1>
      <p className="text-neutral-600">
        Frontend scaffold ready. Implement screens from{" "}
        <code className="text-sm">docs/design_reference/</code> — HTML wins.
      </p>
      <p className="text-sm text-neutral-500">
        API base: <code>{publicEnv.apiBaseUrl}</code>
      </p>
    </main>
  );
}
