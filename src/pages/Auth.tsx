// File: src/pages/Auth.tsx

import { useEffect } from "react";

const AuthPage = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");

    if (shop) {
      const redirectUri = encodeURIComponent(`${window.location.origin}/functions/v1/shopify_oauth_callback`);
      const clientId = import.meta.env.VITE_SHOPIFY_API_KEY;
      const scopes = import.meta.env.VITE_SHOPIFY_SCOPES; // e.g., "read_orders,read_products"

      window.location.href = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;
    } else {
      console.error("❌ No shop found in /auth. Cannot continue.");
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-slate-600">Redirecting to Shopify authentication...</p>
    </div>
  );
};

export default AuthPage;
