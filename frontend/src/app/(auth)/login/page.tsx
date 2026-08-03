import { Suspense } from "react";
import { LoginForm } from "@/features/auth";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-lg px-md py-xl">
      <header className="space-y-xs text-center">
        <p className="font-label-md text-label-md text-primary">PropVista CRM</p>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Sign In</h1>
        <p className="text-body-md text-on-surface-variant">
          Access your account with email and password.
        </p>
      </header>
      <Suspense fallback={<p className="text-center text-body-md text-on-surface-variant">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
