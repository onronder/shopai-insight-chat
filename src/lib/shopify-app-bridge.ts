import createApp, { AppConfigV2 } from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

/**
 * Initializes Shopify App Bridge securely.
 * If missing `host`, attempts OAuth reauthentication.
 */
export function initializeShopifyAppBridge() {
  const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY;
  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host");
  const shop = urlParams.get("shop");

  if (!apiKey || !host) {
    console.warn("⚠️ Missing Shopify API Key or Host. Attempting reauthentication...");

    if (shop) {
      const baseUrl = window.location.origin;
      window.location.href = `${baseUrl}/functions/v1/shopify_auth_start?shop=${encodeURIComponent(shop)}`;
    } else {
      console.error("❌ Missing shop parameter too. Cannot start reauthentication.");
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
