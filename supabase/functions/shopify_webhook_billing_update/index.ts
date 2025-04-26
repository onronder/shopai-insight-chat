// File: supabase/functions/shopify_webhook_billing_update/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { verifyShopifyHMAC } from "../_shared/verifyHMAC.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logError, logInfo } from "../_shared/logging.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const SHOPIFY_API_SECRET = Deno.env.get("PROJECT_SHOPIFY_API_SECRET")!;
const context = "shopify_webhook_billing_update";

serve(async (req) => {
  const path = new URL(req.url).pathname;
  const start = performance.now();

  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256") || "";
    const shopDomain = req.headers.get("x-shopify-shop-domain")?.trim() || "";

    if (!shopDomain) {
      return returnJsonError(400, "Missing shop domain");
    }

    const isValid = await verifyShopifyHMAC(rawBody, hmacHeader, SHOPIFY_API_SECRET);
    if (!isValid) {
      logError(context, "Invalid HMAC signature", { shopDomain });
      return returnJsonError(401, "Unauthorized");
    }

    const payload = JSON.parse(rawBody);
    const subscriptionStatus = payload.status?.toLowerCase();

    if (!subscriptionStatus) {
      return returnJsonError(400, "Missing subscription status");
    }

    // Find store_id first
    const { data: store, error: storeError } = await supabase
      .from("shopify_stores")
      .select("id")
      .eq("domain", shopDomain)
      .maybeSingle();

    if (storeError || !store) {
      logError(context, storeError || "Store not found", { shopDomain });
      return returnJsonError(404, "Store not found");
    }

    const store_id = store.id;
    const now = new Date().toISOString();

    if (["cancelled", "expired", "declined", "frozen"].includes(subscriptionStatus)) {
      // Subscription terminated → Mark store_plan as inactive
      await supabase
        .from("store_plans")
        .update({
          active: false,
          updated_at: now,
        })
        .eq("store_id", store_id)
        .select();

      logInfo(context, "Store subscription deactivated", {
        store_id,
        subscriptionStatus,
      });
    }

    // Log webhook event
    await supabase.from("webhook_logs").insert({
      store_id,
      topic: "billing/update",
      payload,
    });

    logInfo(context, "Billing webhook processed", {
      duration_ms: performance.now() - start,
      store_id,
      subscriptionStatus,
    });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError(context, err, { path });
    return returnJsonError(500, "Webhook Error");
  }
});
