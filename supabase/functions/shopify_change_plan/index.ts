// File: supabase/functions/shopify_change_plan/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logInfo, logError } from "../_shared/logging.ts";
import { verifyShopifySessionToken } from "../_shared/verifyShopifySession.ts"; // ✅ Token check
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const SHOPIFY_API_VERSION = Deno.env.get("PROJECT_SHOPIFY_API_VERSION")!;
const context = "shopify_change_plan";

serve(async (req: Request): Promise<Response> => {
  const path = new URL(req.url).pathname;

  try {
    // ✅ 1. Verify session
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return addSecurityHeaders(returnJsonError(401, "Unauthorized: Missing Authorization header"));
    }
    const token = authHeader.replace("Bearer ", "").trim();

    const verification = await verifyShopifySessionToken(token, "user");
    if (!verification.valid) {
      return addSecurityHeaders(returnJsonError(401, "Unauthorized: Invalid session token"));
    }
    const store_id = verification.store_id;

    // ✅ 2. Parse body
    const { new_plan } = await req.json();

    if (!new_plan) {
      return addSecurityHeaders(returnJsonError(400, "Missing required parameters: new_plan"));
    }

    // ✅ 3. Get store info
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("access_token, shop_domain")
      .eq("id", store_id)
      .maybeSingle();

    if (storeError || !store?.access_token || !store?.shop_domain) {
      logError(context, "Store not found or missing access token/domain", { store_id });
      return addSecurityHeaders(returnJsonError(404, "Store not found or missing access token/domain"));
    }

    const shop = store.shop_domain;

    const headers = {
      "X-Shopify-Access-Token": store.access_token,
      "Content-Type": "application/json",
    };

    const billingPayload = {
      recurring_application_charge: {
        name: `${new_plan} Plan`,
        price: 0.0,
        return_url: `${Deno.env.get("PROJECT_SHOPIFY_BILLING_RETURN_URL")}?store_id=${store_id}&plan=${new_plan}`,
        trial_days: 0,
        test: Deno.env.get("PROJECT_ENV") === "dev",
      },
    };

    const res = await fetch(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/recurring_application_charges.json`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(billingPayload),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      logError(context, "Failed to create billing session", {
        store_id,
        error: errorText,
        status: res.status,
      });
      return addSecurityHeaders(returnJsonError(500, "Failed to create billing session"));
    }

    const json = await res.json();
    const confirmationUrl = json?.recurring_application_charge?.confirmation_url;

    if (!confirmationUrl) {
      logError(context, "No confirmation URL returned", { store_id });
      return addSecurityHeaders(returnJsonError(400, "Failed to retrieve confirmation URL"));
    }

    logInfo(context, "Redirecting to billing confirmation", {
      store_id,
      new_plan,
      confirmationUrl,
    });

    return addSecurityHeaders(
      new Response(JSON.stringify({ confirmation_url: confirmationUrl }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

  } catch (err) {
    logError(context, err, { path });
    return addSecurityHeaders(returnJsonError(500, "Unexpected error during plan change"));
  }
});
