"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-store";

/** Prompts an unverified customer to confirm their email. Renders nothing
 *  once the account is verified. In development, where no real email is sent,
 *  it surfaces the verification link directly so it can be clicked. */
export function VerifyBanner() {
  const { user, devVerifyUrl, resendVerification } = useAuth();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user || user.emailVerified) return null;

  const resend = async () => {
    setBusy(true);
    setError(null);
    try {
      const { alreadyVerified } = await resendVerification();
      if (!alreadyVerified) setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not resend just now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-10 border border-cognac/40 bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <p className="eyebrow text-cognac-deep">Confirm your email</p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/80">
            We&apos;ve sent a confirmation link to{" "}
            <span className="text-foreground">{user.email}</span>. Please confirm
            it to secure your account and gather any orders placed with this email.
          </p>
          {sent && (
            <p className="mt-3 text-sm text-cognac-deep">
              A fresh link is on its way — check your inbox.
            </p>
          )}
          {error && <p className="mt-3 text-sm text-cognac-deep">{error}</p>}

          {devVerifyUrl && (
            <div className="mt-4 border-l-2 border-cognac bg-bone-soft/60 px-4 py-3">
              <p className="eyebrow text-muted">Development mode — no email is sent</p>
              <a
                href={devVerifyUrl}
                className="link-underline mt-2 inline-block break-all text-sm text-cognac-deep"
              >
                Click here to confirm your email →
              </a>
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2">
          <button
            onClick={resend}
            disabled={busy}
            className="eyebrow cursor-pointer border border-espresso bg-espresso px-6 py-3 text-bone transition-colors duration-300 hover:bg-cognac-deep disabled:opacity-40"
          >
            {busy ? "Sending…" : "Resend Email"}
          </button>
          <button
            onClick={() => useAuth.getState().refreshUser()}
            className="link-underline eyebrow cursor-pointer text-muted"
          >
            I&apos;ve confirmed
          </button>
        </div>
      </div>
    </div>
  );
}
