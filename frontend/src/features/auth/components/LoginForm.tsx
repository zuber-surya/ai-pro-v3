"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Input } from "@/components/ui";
import { getMe, login } from "@/lib/api";
import { setAuthTokens, setCurrentUser } from "@/lib/auth";
import { AppError } from "@/types/api";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: typeof fieldErrors = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email";
    }
    if (!password) next.password = "Password is required";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const tokens = await login({ email: email.trim(), password });
      setAuthTokens({ access: tokens.accessToken, refresh: tokens.refreshToken });
      setCurrentUser(await getMe());
      router.push("/customer");
    } catch (err) {
      if (err instanceof AppError) {
        setFormError(
          err.code === "AUTH_INVALID_CREDENTIALS"
            ? "Invalid email or password"
            : err.message,
        );
      } else {
        setFormError("Unable to sign in. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-md flex-col gap-md" noValidate>
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
      />
      {formError ? (
        <p className="text-body-sm text-error" role="alert">
          {formError}
        </p>
      ) : null}
      <Button type="submit" variant="primary" disabled={submitting} className="w-full">
        {submitting ? "Signing in…" : "Sign In"}
      </Button>
      <p className="text-body-sm text-on-surface-variant">
        New here?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
