"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Input } from "@/components/ui";
import { getMe, register } from "@/lib/api";
import { setAuthTokens, setCurrentUser } from "@/lib/auth";
import { AppError } from "@/types/api";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: typeof fieldErrors = {};
    if (!fullName.trim()) next.fullName = "Name is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email";
    }
    if (password.length < 8) next.password = "Password must be at least 8 characters";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const tokens = await register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      });
      setAuthTokens({ access: tokens.accessToken, refresh: tokens.refreshToken });
      setCurrentUser(await getMe());
      router.push("/customer");
    } catch (err) {
      if (err instanceof AppError) {
        if (err.code === "CONFLICT_DUPLICATE_EMAIL") {
          setFieldErrors((prev) => ({ ...prev, email: "Email already registered" }));
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError("Unable to register. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-md flex-col gap-md" noValidate>
      <Input
        label="Full name"
        name="fullName"
        autoComplete="name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={fieldErrors.fullName}
      />
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
        autoComplete="new-password"
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
        {submitting ? "Creating account…" : "Join AI Pro"}
      </Button>
      <p className="text-body-sm text-on-surface-variant">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}
