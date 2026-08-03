import { Suspense } from "react";
import { RegisterForm } from "@/features/auth";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-lg px-md py-xl">
      <header className="space-y-xs text-center">
        <p className="font-label-md text-label-md text-ai-accent">Join AI Pro</p>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Create account</h1>
        <p className="text-body-md text-on-surface-variant">
          Register as a customer to save favorites and inquire on listings.
        </p>
      </header>
      <Suspense fallback={<p className="text-center text-body-md text-on-surface-variant">Loading…</p>}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
