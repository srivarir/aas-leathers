"use client";

/**
 * API base URL, resolved at call time:
 * 1. NEXT_PUBLIC_API_URL when set at build time,
 * 2. localhost:5000 during local development,
 * 3. otherwise the `api.` subdomain of wherever the site is served —
 *    so one static build works on any domain without configuration.
 */
function apiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window === "undefined") return "http://localhost:5000/api";
  const { protocol, hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000/api";
  }
  return `${protocol}//api.${hostname.replace(/^www\./, "")}/api`;
}

export class ApiRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Access token lives in memory only; the refresh token is an httpOnly cookie.
let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};
export const getAccessToken = () => accessToken;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${apiUrl()}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiRequestError(
      res.status,
      typeof body.error === "string" ? body.error : "Something went wrong.",
    );
  }
  return body as T;
}

/**
 * Authenticated request with a single silent retry: if the access token has
 * expired, exchange the refresh cookie for a new one and replay the call.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  try {
    return await request<T>(path, init);
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401 && accessToken) {
      const refreshed = await tryRefresh();
      if (refreshed) return request<T>(path, init);
    }
    throw err;
  }
}

/** Uploads image files to the API, returning their hosted URLs. */
export async function apiUpload(files: File[]): Promise<string[]> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));

  // No Content-Type header — the browser sets the multipart boundary.
  const attempt = () =>
    fetch(`${apiUrl()}/uploads`, {
      method: "POST",
      credentials: "include",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: form,
    });

  let res = await attempt();
  if (res.status === 401 && (await tryRefresh())) res = await attempt();

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiRequestError(res.status, body.error ?? "Upload failed.");
  }
  return body.urls as string[];
}

/** Authenticated binary download (e.g. invoice PDFs) with refresh retry. */
export async function apiDownload(path: string, filename: string): Promise<void> {
  const attempt = () =>
    fetch(`${apiUrl()}${path}`, {
      credentials: "include",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });

  let res = await attempt();
  if (res.status === 401 && (await tryRefresh())) res = await attempt();
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiRequestError(res.status, body.error ?? "Download failed.");
  }

  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

export async function tryRefresh(): Promise<ApiUser | null> {
  try {
    const data = await request<{ user: ApiUser; accessToken: string }>(
      "/auth/refresh",
      { method: "POST" },
    );
    accessToken = data.accessToken;
    return data.user;
  } catch {
    accessToken = null;
    return null;
  }
}
