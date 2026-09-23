import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  // AuthForm reads ?next= to return you where you came from, so it needs a
  // Suspense boundary to be prerendered.
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <AuthForm mode="register" />
    </Suspense>
  );
}
