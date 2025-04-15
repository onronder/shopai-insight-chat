// supabase/functions/shopify_webhook_orders_update/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logInfo, logError } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import "https://deno.land/x/dotenv/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const start = performance.now();
  const path = new URL(req.url).pathname;

  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);
    const shopifyDomain = req.headers.get("x-shopify-shop-domain") || "";

    const { data: store, error: storeError } = await supabase
      .from("shopify_stores")
      .select("id")
      .eq("domain", shopifyDomain)
      .maybeSingle();

    if (storeError || !store) {
      logError("shopify_webhook_orders_update", "Store not found", {
        shopifyDomain,
      });
      return returnJsonError(404, "Store not found");
    }

    const shopify_order_id = payload.id?.toString();
    if (!shopify_order_id) {
      return returnJsonError(400, "Missing order ID");
    }

    const update = {
      shopify_order_id,
      total_price: payload.total_price,
      subtotal_price: payload.subtotal_price,
      total_discount: payload.total_discounts,
      currency: payload.currency,
      financial_status: payload.financial_status,
      fulfillment_status: payload.fulfillment_status,
      processed_at: payload.processed_at,
    };

    const { error: updateErr } = await supabase
      .from("shopify_orders")
      .update(update)
      .eq("shopify_order_id", shopify_order_id)
      .eq("store_id", store.id);

    if (updateErr) {
      logError("shopify_webhook_orders_update", updateErr, {
        shopify_order_id,
        store_id: store.id,
      });
      return returnJsonError(500, "Failed to update order");
    }

    const { error: logErr } = await supabase.from("webhook_logs").insert({
      store_id: store.id,
      topic: "orders/update",
      shopify_order_id,
      payload,
    });

    if (logErr) {
      logError("shopify_webhook_orders_update", logErr, {
        store_id: store.id,
        shopify_order_id,
      });
    }

    logInfo("shopify_webhook_orders_update", "Order updated successfully", {
      shopify_order_id,
      store_id: store.id,
    });

    const duration = performance.now() - start;
    logInfo("shopify_webhook_orders_update", "Request completed", {
      path,
      duration_ms: duration,
    });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError("shopify_webhook_orders_update", err, { path });
    return returnJsonError(500, "Webhook Error");
  }
});
