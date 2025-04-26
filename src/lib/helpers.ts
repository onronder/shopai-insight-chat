// File: src/lib/helpers.ts

declare global {
    interface Window {
      Shopify?: {
        shop?: string;
        domain?: string;
        admin?: {
          shop?: string;
        };
      };
    }
  }
  
  /**
   * Safely get the shop domain from window.Shopify if available
   */
  export function getShopDomain(): string | null {
    if (typeof window === "undefined") return null;
  
    const shop = window.Shopify?.shop || window.Shopify?.admin?.shop;
    if (shop) {
      return shop.endsWith(".myshopify.com") ? shop : `${shop}.myshopify.com`;
    }
  
    const urlShop = new URLSearchParams(window.location.search).get("shop");
    return urlShop ? urlShop : null;
  }
  
  /**
   * Safely get the Supabase sb-token from cookies
   */
  export function getSbToken(): string | null {
    if (typeof document === "undefined") return null;
  
    const match = document.cookie.match(new RegExp(`(^| )sb-token=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  }
  
  /**
   * Parse a Shopify webhook request body
   */
  export async function parseShopifyWebhook(req: Request): Promise<Record<string, unknown>> {
    try {
      const text = await req.text();
      return JSON.parse(text);
    } catch {
      return {};
    }
  }
  