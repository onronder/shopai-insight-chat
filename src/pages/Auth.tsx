// File: src/pages/Auth.tsx

import { useEffect } from "react";

const AuthPage = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shop = urlParams.get("shop");

    if (shop) {
      const baseUrl = window.location.origin;
      window.location.href = `${baseUrl}/functions/v1/shopify_auth_start?shop=${encodeURIComponent(shop)}`;
    } else {
      console.error("❌ No shop found in /auth. Cannot continue.");
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-center text-lg text-slate-600">
        Redirecting to Shopify authentication...
      </p>
    </div>
  );
};

export default AuthPage;
