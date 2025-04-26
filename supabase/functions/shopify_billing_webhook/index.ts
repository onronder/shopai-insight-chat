// File: supabase/functions/shopify_billing_webhook/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { logInfo, logError } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { verifyShopifyHMAC } from "../_shared/verifyHMAC.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const SHOPIFY_SECRET = Deno.env.get("PROJECT_SHOPIFY_API_SECRET")!;
const context = "shopify_billing_webhook";

serve(async (req) => {
  const start = performance.now();
  const path = new URL(req.url).pathname;

  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256") || "";

    const valid = await verifyShopifyHMAC(rawBody, hmacHeader, SHOPIFY_SECRET);
    if (!valid) {
      logError(context, "Invalid HMAC signature", { path });
      return returnJsonError(401, "Unauthorized");
    }

    const payload = JSON.parse(rawBody);
    const shop = req.headers.get("x-shopify-shop-domain")?.trim();
    const topic = req.headers.get("x-shopify-topic")?.trim();

    if (!shop || !topic || !payload?.id) {
      return returnJsonError(400, "Missing required webhook fields");
    }

    // Find the store
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id")
      .eq("shop_domain", shop)
      .maybeSingle();

    if (storeError || !store) {
      return returnJsonError(404, "Store not found");
    }

    // Handle topic updates
    switch (topic) {
      case "APP_SUBSCRIPTIONS_UPDATE": {
        const newPlan = payload.name;
        const newTrialEnd = payload.trial_ends_on || null;
        const billingOn = payload.billing_on || null;

        const { error: updateErr } = await supabase.from("store_plans").update({
          plan: newPlan,
          trial_ends_at: newTrialEnd,
          billing_starts_at: billingOn,
          updated_at: new Date().toISOString()
        }).eq("store_id", store.id);

        if (updateErr) {
          logError(context, "Failed to update store plan", { store_id: store.id, error: updateErr.message });
        } else {
          logInfo(context, "Store plan updated via webhook", { store_id: store.id, plan: newPlan });
        }
        break;
      }
      case "APP_SUBSCRIPTIONS_CANCELLED": {
        const { error: cancelErr } = await supabase.from("store_plans").update({
          active: false,
          updated_at: new Date().toISOString()
        }).eq("store_id", store.id);

        if (cancelErr) {
          logError(context, "Failed to cancel store plan", { store_id: store.id, error: cancelErr.message });
        } else {
          logInfo(context, "Store plan cancelled via webhook", { store_id: store.id });
        }
        break;
      }
      default:
        logInfo(context, "Unhandled webhook topic", { topic });
    }

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError(context, err, { path });
    return returnJsonError(500, "Unexpected error");
  } finally {
    logInfo(context, "Webhook processed", { duration_ms: performance.now() - start });
  }
});
