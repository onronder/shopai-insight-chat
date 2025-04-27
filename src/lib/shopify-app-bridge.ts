// File: src/lib/shopify-app-bridge.ts

import createApp, { AppConfigV2 } from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

/**
 * Safely initializes Shopify App Bridge.
 */
export function initializeShopifyAppBridge() {
  const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY;
  const params = new URLSearchParams(window.location.search);
  const host = params.get("host");
  const shop = params.get("shop");
  const embedded = params.get("embedded");

  if (!apiKey || !host) {
    console.warn("⚡ Missing host or apiKey. Trying to fix...");
    if (embedded && shop) {
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
 * Fetches Shopify session token.
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
