// File: src/lib/shopify-app-bridge.ts

import createApp, { AppConfigV2 } from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

/**
 * Initializes Shopify App Bridge securely.
 * Redirects to /auth if host/shop missing.
 */
export function initializeShopifyAppBridge() {
  const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY;
  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host");
  const shop = urlParams.get("shop");

  if (!apiKey || !host) {
    console.warn("⚡ Missing host or apiKey. Trying to fix...");

    if (shop) {
      console.warn("⚡ Redirecting to /auth for reauthentication...");
      const baseUrl = window.location.origin;
      window.location.href = `${baseUrl}/auth?shop=${encodeURIComponent(shop)}`;
    } else {
      console.error("❌ Cannot fix: missing shop too.");
    }
    return null;
  }

  const config: AppConfigV2 = {
    apiKey,
    host,
    forceRedirect: true,
  };

  return createApp(config);
}

/**
 * Fetches a fresh Shopify session token (JWT) from App Bridge.
 */
export async function fetchSessionToken(app: ReturnType<typeof createApp>) {
  try {
    const token = await getSessionToken(app);
    return token;
  } catch (error) {
    console.error("❌ Failed to fetch session token:", error);
    return null;
  }
}
