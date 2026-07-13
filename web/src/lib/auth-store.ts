"use client";

import { create } from "zustand";
import { apiFetch, setAccessToken, tryRefresh, type ApiUser } from "./api";

interface AuthState {
  user: ApiUser | null;
  /** "unknown" until the first silent refresh attempt resolves. */
  status: "unknown" | "guest" | "authenticated";
  /** Dev-only: the verification link, surfaced when real email isn't sent. */
  devVerifyUrl: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restore: () => Promise<void>;
  /** Re-fetch the current user (e.g. after email verification). */
  refreshUser: () => Promise<void>;
  /** Request a fresh verification email; returns whether already verified. */
  resendVerification: () => Promise<{ alreadyVerified: boolean }>;
}

interface AuthPayload {
  user: ApiUser;
  accessToken: string;
  devVerifyUrl?: string;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  status: "unknown",
  devVerifyUrl: null,

  login: async (email, password) => {
    const data = await apiFetch<AuthPayload>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAccessToken(data.accessToken);
    set({ user: data.user, status: "authenticated" });
  },

  register: async (name, email, password) => {
    const data = await apiFetch<AuthPayload>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setAccessToken(data.accessToken);
    set({
      user: data.user,
      status: "authenticated",
      devVerifyUrl: data.devVerifyUrl ?? null,
    });
  },

  logout: async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      setAccessToken(null);
      set({ user: null, status: "guest" });
    }
  },

  restore: async () => {
    if (get().status !== "unknown") return;
    const user = await tryRefresh();
    set(user ? { user, status: "authenticated" } : { status: "guest" });
  },

  refreshUser: async () => {
    try {
      const { user } = await apiFetch<{ user: ApiUser }>("/auth/me");
      set({ user, status: "authenticated" });
    } catch {
      /* not signed in — leave state as-is */
    }
  },

  resendVerification: async () => {
    const data = await apiFetch<{
      ok: boolean;
      alreadyVerified?: boolean;
      devVerifyUrl?: string;
    }>("/auth/resend-verification", { method: "POST" });
    if (data.devVerifyUrl) set({ devVerifyUrl: data.devVerifyUrl });
    if (data.alreadyVerified) await get().refreshUser();
    return { alreadyVerified: Boolean(data.alreadyVerified) };
  },
}));
