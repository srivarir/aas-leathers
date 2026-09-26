"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface MailStatus {
  config: {
    mode: "brevo" | "smtp" | "none";
    sendingRealMail: boolean;
    smtpHost: string | null;
    smtpPort: string | null;
    smtpUser: string | null;
    smtpPasswordSet: boolean;
    from: string;
    fromVerify: string;
    verifyDiffersFromLogin: boolean;
  };
  connection: { ok: boolean; error?: string; code?: string | null; note?: string };
}

interface TestResult {
  ok: boolean;
  to: string;
  sentAs?: string;
  fellBack?: boolean;
  reason?: string;
  error?: string;
  code?: string | null;
  response?: string | null;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-2">
      <span className="eyebrow text-muted">{label}</span>
      <span className="text-sm tabular-nums">{value}</span>
    </div>
  );
}

export function MailCheck() {
  const [status, setStatus] = useState<MailStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<MailStatus>("/stats/mail")
      .then(setStatus)
      .catch((e) => setError(e.message));
  }, []);

  const test = async (which: "orders" | "verify") => {
    setSending(which);
    setResult(null);
    try {
      setResult(
        await apiFetch<TestResult>("/stats/mail", {
          method: "POST",
          body: JSON.stringify({ which }),
        }),
      );
    } catch (e) {
      setResult({
        ok: false,
        to: "",
        error: e instanceof Error ? e.message : "The check itself failed.",
      });
    } finally {
      setSending(null);
    }
  };

  if (error) return null;
  if (!status) {
    return <div className="h-40 animate-pulse border border-line bg-bone-soft/60" />;
  }

  const { config, connection } = status;
  const healthy = config.sendingRealMail && connection.ok;

  return (
    <div className="border border-line p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="eyebrow text-muted">Mail</p>
        <span
          className={`eyebrow ${healthy ? "text-cognac" : "text-cognac-deep"}`}
        >
          {healthy ? "working" : "not sending"}
        </span>
      </div>

      {!config.sendingRealMail && (
        <p className="mt-4 border-l-2 border-cognac pl-4 text-sm leading-relaxed text-cognac-deep">
          No mail service is configured, so every message is written to the log
          and thrown away. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS on
          the API.
        </p>
      )}

      {config.sendingRealMail && !connection.ok && (
        <p className="mt-4 border-l-2 border-cognac pl-4 text-sm leading-relaxed text-cognac-deep">
          The mail server refused the connection: {connection.error}
        </p>
      )}

      {config.verifyDiffersFromLogin && (
        <p className="mt-4 border-l-2 border-cognac pl-4 text-sm leading-relaxed text-cognac-deep">
          Verification mail is sent from an address the SMTP login does not own.
          Many mail hosts reject that outright. Make it an alias of{" "}
          {config.smtpUser}, or clear MAIL_FROM_VERIFY to send everything from
          the main address.
        </p>
      )}

      <div className="mt-5 divide-y divide-line border-y border-line">
        <Row label="Sending via" value={config.mode} />
        {config.smtpHost && (
          <Row label="Host" value={`${config.smtpHost}:${config.smtpPort ?? "?"}`} />
        )}
        {config.smtpUser && <Row label="Signed in as" value={config.smtpUser} />}
        {config.smtpHost && (
          <Row label="Password" value={config.smtpPasswordSet ? "set" : "missing"} />
        )}
        <Row label="Orders sent from" value={config.from} />
        <Row label="Verification sent from" value={config.fromVerify} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-5">
        <button
          className="link-underline eyebrow cursor-pointer disabled:opacity-40"
          disabled={sending !== null}
          onClick={() => test("orders")}
        >
          {sending === "orders" ? "Sending…" : "Test orders address"}
        </button>
        <button
          className="link-underline eyebrow cursor-pointer disabled:opacity-40"
          disabled={sending !== null}
          onClick={() => test("verify")}
        >
          {sending === "verify" ? "Sending…" : "Test verification address"}
        </button>
      </div>

      {result && (
        <div className="mt-5 border-l-2 border-cognac pl-4 text-sm leading-relaxed">
          {result.ok ? (
            result.fellBack ? (
              <p className="text-cognac-deep">
                Delivered to {result.to}, but the mail server refused the
                address you asked for, so it went out as {result.sentAs}{" "}
                instead. Customers still get their mail. To use the other
                address, make it an alias of {status.config.smtpUser}.
              </p>
            ) : (
              <p>
                Sent to {result.to} as {result.sentAs}. If it does not arrive,
                check the spam folder — the message left the server.
              </p>
            )
          ) : (
            <p className="text-cognac-deep">
              Refused: {result.error}
              {result.response ? ` — ${result.response}` : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
