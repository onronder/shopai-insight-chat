import { useEffect } from "react";

const AuthPage = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shop = urlParams.get("shop");

    if (!shop) {
      console.error("❌ No shop found in /auth. Cannot continue.");
      return;
    }

    const redirectUrl = new URL(`https://${shop}/admin/oauth/authorize`);
    redirectUrl.searchParams.set("client_id", import.meta.env.VITE_SHOPIFY_API_KEY!);
    redirectUrl.searchParams.set("scope", import.meta.env.VITE_SHOPIFY_SCOPES!);
    redirectUrl.searchParams.set("redirect_uri", `${window.location.origin}/functions/v1/shopify_oauth_callback`);

    window.location.href = redirectUrl.toString();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-slate-600">Redirecting to Shopify authentication...</p>
    </div>
  );
};

export default AuthPage;
