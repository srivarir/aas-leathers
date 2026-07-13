"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-store";

function Field({
  id,
  label,
  type,
  autoComplete,
}: {
  id: string;
  label: string;
  type: string;
  autoComplete: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow block text-muted">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required
        autoComplete={autoComplete}
        className="mt-2 w-full border-b border-line bg-transparent py-3 transition-colors duration-300 focus:border-foreground focus:outline-none"
      />
    </div>
  );
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const router = useRouter();
  const { login, register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      if (isLogin) {
        await login(String(form.get("email")), String(form.get("password")));
      } else {
        await register(
          String(form.get("name")),
          String(form.get("email")),
          String(form.get("password")),
        );
      }
      router.push("/account");
    } catch (err) {
      setError(
        err instanceof Error && err.message !== "Failed to fetch"
          ? err.message
          : "We couldn't reach the workshop. Is the API server running?",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-6 py-32">
      <Reveal>
        <p className="eyebrow text-muted">{isLogin ? "Welcome back" : "Join the house"}</p>
        <h1 className="font-display mt-4 text-4xl tracking-tight">
          {isLogin ? "Sign in" : "Create your account"}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {isLogin
            ? "Your orders, wishlist and repair history, kept in one quiet place."
            : "An account keeps your orders, addresses and the story of every piece you carry."}
        </p>
      </Reveal>

      <form className="mt-12 space-y-8" onSubmit={onSubmit}>
        {!isLogin && <Field id="name" label="Full name" type="text" autoComplete="name" />}
        <Field id="email" label="Email" type="email" autoComplete="email" />
        <Field
          id="password"
          label={isLogin ? "Password" : "Password (8+ characters)"}
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
        {error && (
          <p role="alert" className="border-l-2 border-cognac pl-4 text-sm text-cognac-deep">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "One moment…" : isLogin ? "Sign In" : "Create Account"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        {isLogin ? "New to the house? " : "Already with us? "}
        <Link
          href={(isLogin ? "/register" : "/login") as Route}
          className="link-underline text-foreground"
        >
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
