// File: src/hooks/useShopifyAuthGuard.ts

import { useEffect } from "react";

export function useShopifyAuthGuard() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const host = params.get("host");
    const shop = params.get("shop");

    if (!host || !shop) {
      console.warn("⚡ Missing host/shop. Redirecting to authentication...");
      window.location.href = `/auth?redirectUrl=${encodeURIComponent(window.location.pathname)}`;
    }
  }, []);
}
