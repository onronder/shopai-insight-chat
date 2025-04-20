import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createJWT } from "../_shared/jwt.ts";
import { setSecureCookie } from "../_shared/cookies.ts";
import { logInfo, logError } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import "https://deno.land/x/dotenv/load.ts";

// Env
const SHOPIFY_API_KEY = Deno.env.get("PROJECT_SHOPIFY_API_KEY")!;
const SHOPIFY_API_SECRET = Deno.env.get("PROJECT_SHOPIFY_API_SECRET")!;
const SHOPIFY_API_VERSION = Deno.env.get("PROJECT_SHOPIFY_API_VERSION")!;
const SUPABASE_URL = Deno.env.get("PROJECT_SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

serve(async (req) => {
  const start = performance.now();
  const path = new URL(req.url).pathname;

  try {
    logInfo("shopify_oauth_callback", "OAuth callback started", { path });

    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");
    const code = searchParams.get("code");

    if (!shop || !code) {
      return addSecurityHeaders(returnJsonError(400, "Missing shop or code"));
    }

    // Exchange code for access token
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      logError("shopify_oauth_callback", err, { shop });
      return addSecurityHeaders(returnJsonError(401, "Failed to retrieve access token"));
    }

    const { access_token } = await tokenRes.json();

    // Fetch timezone from Shopify
    const timezoneRes = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/shop.json`, {
      headers: {
        "X-Shopify-Access-Token": access_token,
        "Content-Type": "application/json",
      },
    });

    let iana_timezone: string | null = null;

    if (timezoneRes.ok) {
      const json = await timezoneRes.json();
      iana_timezone = json?.shop?.iana_timezone || null;
    } else {
      logError("shopify_oauth_callback", "Failed to fetch timezone from shop.json", {
        status: timezoneRes.status,
      });
    }

    // Check if store exists
    const { data: existing, error: fetchError } = await supabase
      .from("stores")
      .select("id")
      .eq("shop_domain", shop)
      .maybeSingle();

    let store_id = existing?.id;

    if (store_id) {
      await supabase
        .from("stores")
        .update({ access_token, iana_timezone })
        .eq("id", store_id);
    } else {
      const { data, error } = await supabase
        .from("stores")
        .insert({ shop_domain: shop, access_token, iana_timezone })
        .select("id")
        .single();

      if (error || !data) {
        logError("shopify_oauth_callback", error?.message ?? "Insert failed", { shop });
        return addSecurityHeaders(returnJsonError(500, "Store creation failed"));
      }

      store_id = data.id;
    }

    // Generate signed JWT
    const now = Math.floor(Date.now() / 1000);
    const jwt = await createJWT({
      sub: store_id,
      role: "authenticated",
      iat: now,
      exp: now + 60 * 60,
    });

    const headers = new Headers();
    headers.set("Set-Cookie", setSecureCookie("sb-token", jwt, 3600, "Path=/"));
    headers.set("Location", "http://localhost:3000/dashboard");

    logInfo("shopify_oauth_callback", "JWT issued and user redirected", {
      store_id,
      timezone: iana_timezone,
      duration_ms: performance.now() - start,
    });

    return addSecurityHeaders(new Response(null, { status: 302, headers }));
  } catch (err) {
    logError("shopify_oauth_callback", err, { path });
    return addSecurityHeaders(returnJsonError(500, "OAuth error occurred"));
  }
});
