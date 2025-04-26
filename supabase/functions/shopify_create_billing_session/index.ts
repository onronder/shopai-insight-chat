// File: supabase/functions/shopify_create_billing_session/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logInfo, logError } from "../_shared/logging.ts";
import { verifyShopifySessionToken } from "../_shared/verifyShopifySession.ts"; // ✅ Token verifier
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const context = "shopify_create_billing_session";
const SHOPIFY_API_VERSION = Deno.env.get("PROJECT_SHOPIFY_API_VERSION")!;

serve(async (req: Request): Promise<Response> => {
  const path = new URL(req.url).pathname;

  try {
    // ✅ 1. Extract token manually
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return addSecurityHeaders(returnJsonError(401, "Unauthorized: Missing Authorization header"));
    }
    const token = authHeader.replace("Bearer ", "").trim();

    // ✅ 2. Verify token
    const verification = await verifyShopifySessionToken(token, "user");
    if (!verification.valid) {
      return addSecurityHeaders(
        returnJsonError(401, "Unauthorized: Invalid session token")
      );
    }
    const store_id = verification.store_id;

    // ✅ 3. Parse payload
    const payload = await req.json().catch(() => null);
    if (!payload || !payload.plan) {
      return addSecurityHeaders(returnJsonError(400, "Missing billing plan payload"));
    }
    const plan = payload.plan;

    // ✅ 4. Find store by store_id
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("shop_domain, access_token")
      .eq("id", store_id)
      .maybeSingle();

    if (storeError || !store) {
      logError(context, storeError || "Store not found", { store_id });
      return addSecurityHeaders(returnJsonError(404, "Store not found"));
    }

    const shopDomain = store.shop_domain;
    const accessToken = store.access_token;

    // ✅ 5. Create Shopify billing session
    const billingUrl = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/recurring_application_charges.json`;

    const billingPayload = {
      recurring_application_charge: {
        name: `${plan.name} Plan`,
        price: plan.price,
        return_url: plan.return_url,
        test: plan.test ?? true,
        trial_days: plan.trial_days ?? 3,
        interval: plan.interval ?? "every_30_days",
      },
    };

    const response = await fetch(billingUrl, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(billingPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logError(context, "Failed to create billing session", {
        status: response.status,
        store_id,
        error: errorText,
      });
      return addSecurityHeaders(returnJsonError(500, "Failed to create billing session"));
    }

    const result = await response.json();
    const confirmationUrl = result.recurring_application_charge?.confirmation_url;

    if (!confirmationUrl) {
      logError(context, "Billing session created but missing confirmation URL", { store_id });
      return addSecurityHeaders(returnJsonError(500, "Billing session missing confirmation URL"));
    }

    // ✅ 6. Return success
    logInfo(context, "Billing session created", { store_id, confirmationUrl });

    return addSecurityHeaders(
      new Response(JSON.stringify({ url: confirmationUrl }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

  } catch (err) {
    logError(context, err, { path });
    return addSecurityHeaders(returnJsonError(500, "Unexpected error occurred"));
  }
});
