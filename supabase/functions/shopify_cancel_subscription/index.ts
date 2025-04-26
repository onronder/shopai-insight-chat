// File: supabase/functions/shopify_cancel_subscription/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logInfo, logError } from "../_shared/logging.ts";
import { verifyShopifySessionToken } from "../_shared/verifyShopifySession.ts"; // ✅ Add token check
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const SHOPIFY_API_VERSION = Deno.env.get("PROJECT_SHOPIFY_API_VERSION")!;
const context = "shopify_cancel_subscription";

serve(async (req: Request): Promise<Response> => {
  const path = new URL(req.url).pathname;

  try {
    // ✅ 1. Extract and verify session token
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

    // ✅ 2. Fetch active subscription info
    const { data: storePlan, error: planError } = await supabase
      .from("store_plans")
      .select("shopify_charge_id")
      .eq("store_id", store_id)
      .eq("active", true)
      .maybeSingle();

    if (planError || !storePlan?.shopify_charge_id) {
      logError(context, "No active subscription found for store", { store_id });
      return addSecurityHeaders(returnJsonError(404, "No active subscription found for this store"));
    }

    // ✅ 3. Fetch store access token
    const { data: storeData, error: storeError } = await supabase
      .from("stores")
      .select("domain, access_token")
      .eq("id", store_id)
      .maybeSingle();

    if (storeError || !storeData?.access_token || !storeData?.domain) {
      logError(context, "Store not found or missing access token", { store_id });
      return addSecurityHeaders(returnJsonError(404, "Store not found or missing access token"));
    }

    const cancelUrl = `https://${storeData.domain}/admin/api/${SHOPIFY_API_VERSION}/recurring_application_charges/${storePlan.shopify_charge_id}/cancel.json`;

    const cancelRes = await fetch(cancelUrl, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": storeData.access_token,
        "Content-Type": "application/json",
      },
    });

    if (!cancelRes.ok) {
      const cancelErrorText = await cancelRes.text();
      logError(context, "Failed to cancel Shopify charge", { store_id, cancelErrorText });
      return addSecurityHeaders(returnJsonError(500, "Failed to cancel Shopify subscription"));
    }

    const jsonResponse = await cancelRes.json();
    const canceledCharge = jsonResponse?.recurring_application_charge;

    if (!canceledCharge || canceledCharge.status !== "cancelled") {
      logError(context, "Cancellation incomplete or invalid response", { store_id });
      return addSecurityHeaders(returnJsonError(500, "Shopify did not confirm cancellation"));
    }

    // ✅ Optional: Deactivate the plan here if needed (you can extend logic)

    logInfo(context, "Subscription cancellation success", {
      store_id,
      charge_id: storePlan.shopify_charge_id,
    });

    return addSecurityHeaders(
      new Response(
        JSON.stringify({ status: "cancelled", shopify_charge_id: storePlan.shopify_charge_id }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

  } catch (err) {
    logError(context, err, { path });
    return addSecurityHeaders(returnJsonError(500, "Unexpected error in subscription cancellation"));
  }
});
