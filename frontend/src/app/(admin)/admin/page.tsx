import Link from "next/link";

export default function AdminPlaceholderPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-md px-md py-xl">
      <h1 className="font-headline-lg text-headline-lg text-on-surface">Admin home</h1>
      <p className="text-body-md text-on-surface-variant">
        Admin shell (command center comes later). Role guard active.
      </p>
      <Link href="/admin/users" className="text-primary hover:underline">
        Manage users
      </Link>
      <Link href="/admin/agents" className="text-primary hover:underline">
        Manage agents
      </Link>
      <Link href="/properties" className="text-primary hover:underline">
        Property inventory
      </Link>
    </main>
  );
}
