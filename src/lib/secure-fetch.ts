// File: src/lib/secure-fetch.ts

import { refreshToken } from "./initAuth";

/**
 * Reads a secure cookie value by name
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Sends a secure request to Supabase Edge Function with fallback for expired token
 */
export async function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let token = getCookie("sb-token");

  const buildHeaders = (existing: HeadersInit = {}): HeadersInit => ({
    ...existing,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  });

  let response = await fetch(url, {
    ...options,
    headers: buildHeaders(options.headers),
  });

  if (response.status === 401) {
    try {
      const refreshed = await refreshToken();
      if (refreshed) {
        token = getCookie("sb-token");
        response = await fetch(url, {
          ...options,
          headers: buildHeaders(options.headers),
        });
      }
    } catch (err) {
      console.error("🔐 Token refresh failed", err);
    }
  }

  if (response.status === 401) {
    throw new Error("Unauthorized: Unable to refresh access token");
  }

  return response;
}
