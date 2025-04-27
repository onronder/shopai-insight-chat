import createApp, { AppConfigV2 } from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

/**
 * Initializes Shopify App Bridge securely inside embedded apps.
 */
export function initializeShopifyAppBridge() {
  const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY;
  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host");
  const shop = urlParams.get("shop");

  if (!apiKey || !host) {
    console.warn("⚠️ Missing host or apiKey. Trying to fix...");

    if (shop) {
      window.location.href = `/auth?shop=${encodeURIComponent(shop)}`;
    } else {
      console.error("❌ Cannot fix: missing shop too.");
    }
    return null;
  }

  const appBridgeConfig: AppConfigV2 = {
    apiKey,
    host,
    forceRedirect: true,
  };

  return createApp(appBridgeConfig);
}

/**
 * Fetches a fresh Shopify session token.
 */
export async function fetchSessionToken(app: ReturnType<typeof createApp>) {
  try {
    const token = await getSessionToken(app);
    return token;
  } catch (error) {
    console.error("❌ Failed to fetch Shopify session token:", error);
    return null;
  }
}
