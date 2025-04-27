// File: src/lib/shopify-app-bridge.ts

import createApp, { AppConfigV2 } from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

/**
 * Initializes Shopify App Bridge securely.
 */
export function initializeShopifyAppBridge() {
  const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY;
  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host");

  if (!apiKey || !host) {
    console.warn("⚠️ Missing Shopify API Key or Host. Skipping App Bridge initialization.");
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
