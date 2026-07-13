"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/motion";
import { CheckIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";

type State = "verifying" | "success" | "error";

function VerifyEmail() {
  const token = useSearchParams().get("token");
  const refreshUser = useAuth((s) => s.refreshUser);
  const [state, setState] = useState<State>("verifying");
  const [message, setMessage] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard React StrictMode double-invoke
    ran.current = true;

    if (!token) {
      setState("error");
      setMessage("This link is missing its verification token.");
      return;
    }
    apiFetch("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then(() => {
        setState("success");
        // If the visitor is signed in on this device, update their status
        // so the account banner disappears.
        refreshUser();
      })
      .catch((e) => {
        setState("error");
        setMessage(
          e instanceof Error ? e.message : "We couldn't verify this link.",
        );
      });
  }, [token, refreshUser]);

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center px-6 py-32 text-center">
      {state === "verifying" && (
        <>
          <p className="eyebrow text-muted">One moment</p>
          <h1 className="font-display mt-4 text-3xl tracking-tight">
            Confirming your email…
          </h1>
        </>
      )}

      {state === "success" && (
        <Reveal>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cognac text-cognac">
            <CheckIcon width={28} height={28} />
          </div>
          <h1 className="font-display mt-8 text-4xl tracking-tight">
            Email confirmed.
          </h1>
          <p className="mt-4 leading-relaxed text-muted">
            Thank you. Your account is verified, and any orders placed with this
            email are now in your account.
          </p>
          <div className="mt-10">
            <ButtonLink href="/account">Go to Your Account</ButtonLink>
          </div>
        </Reveal>
      )}

      {state === "error" && (
        <Reveal>
          <p className="eyebrow text-muted">Verification</p>
          <h1 className="font-display mt-4 text-3xl tracking-tight">
            This link didn&apos;t work.
          </h1>
          <p className="mt-4 leading-relaxed text-muted">{message}</p>
          <p className="mt-6 text-sm text-muted">
            Verification links expire after 24 hours. Sign in and request a fresh
            one from your account.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/account">Go to Your Account</ButtonLink>
            <ButtonLink href="/" variant="outline">
              Return Home
            </ButtonLink>
          </div>
        </Reveal>
      )}

      <p className="mt-12 text-xs text-muted">
        <Link href="/" className="link-underline">
          AAS Leathers
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <VerifyEmail />
    </Suspense>
  );
}
