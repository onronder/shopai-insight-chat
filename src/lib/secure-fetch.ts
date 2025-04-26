// File: src/lib/secure-fetch.ts

import { refreshToken } from "./initAuth";
import { fetchSessionToken, initializeShopifyAppBridge } from "@/lib/shopify-app-bridge";

const app = initializeShopifyAppBridge();

/**
 * Reads a secure cookie value by name
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Sends a secure request to Supabase Edge Function with fallback for expired Supabase token
 * Automatically attaches Shopify App Bridge session token if available
 */
export async function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let supabaseToken = getCookie("sb-token");
  let shopifyToken: string | null = null;

  try {
    if (app) {
      shopifyToken = await fetchSessionToken(app);
    }
  } catch (error) {
    console.error("⚡ Failed to fetch Shopify session token", error);
  }

  const buildHeaders = (existing: HeadersInit = {}): HeadersInit => ({
    ...existing,
    ...(supabaseToken ? { Authorization: `Bearer ${supabaseToken}` } : {}),
    ...(shopifyToken ? { "X-Shopify-Session-Token": shopifyToken } : {}),
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
        supabaseToken = getCookie("sb-token");
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
