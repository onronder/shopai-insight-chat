// File: supabase/functions/shopify_confirm_billing/index.ts

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

const context = "shopify_confirm_billing";
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

    // ✅ 2. Verify session
    const verification = await verifyShopifySessionToken(token, "user");
    if (!verification.valid) {
      return addSecurityHeaders(returnJsonError(401, "Unauthorized: Invalid session token"));
    }
    const store_id = verification.store_id;

    // ✅ 3. Parse payload
    const { shop, charge_id, plan } = await req.json();
    if (!shop || !charge_id || !plan) {
      return addSecurityHeaders(returnJsonError(400, "Missing required parameters"));
    }

    // ✅ 4. Get store's access token
    const { data: storeData, error: storeError } = await supabase
      .from("stores")
      .select("access_token")
      .eq("id", store_id)
      .maybeSingle();

    if (storeError || !storeData?.access_token) {
      return addSecurityHeaders(returnJsonError(404, "Access token not found"));
    }

    const accessToken = storeData.access_token;

    const confirmUrl = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/recurring_application_charges/${charge_id}.json`;
    const headers = {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    };

    const res = await fetch(confirmUrl, { headers });

    if (!res.ok) {
      const msg = await res.text();
      logError(context, "Failed to fetch billing charge", { charge_id, shop, msg });
      return addSecurityHeaders(returnJsonError(502, "Failed to confirm charge with Shopify"));
    }

    const json = await res.json();
    const charge = json?.recurring_application_charge;

    if (!charge || charge.status !== "active") {
      logError(context, "Charge not active", { charge });
      return addSecurityHeaders(returnJsonError(400, "Charge not active or invalid"));
    }

    // ✅ 5. Upsert into store_plans
    const now = new Date().toISOString();
    const trialEnds = charge.trial_ends_on ?? charge.billing_on;

    const { error: upsertError } = await supabase.from("store_plans").upsert({
      store_id,
      plan,
      active: true,
      shopify_charge_id: charge.id,
      shopify_plan_name: charge.name,
      billing_interval: charge.interval,
      shopify_status: charge.status,
      trial_ends_at: trialEnds,
      will_renew: true,
      created_at: now,
      updated_at: now,
    });

    if (upsertError) {
      logError(context, "Failed to upsert plan", {
        error: upsertError.message,
        store_id,
        charge_id,
      });
      return addSecurityHeaders(returnJsonError(500, "Failed to store plan"));
    }

    logInfo(context, "Billing confirmed", {
      store_id,
      charge_id,
      plan,
      trialEnds,
    });

    return addSecurityHeaders(
      new Response(JSON.stringify({ status: "confirmed" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

  } catch (err) {
    logError(context, err, { path });
    return addSecurityHeaders(returnJsonError(500, "Unexpected error in billing confirmation"));
  }
});
