// File: supabase/functions/shopify_webhook_orders_delete/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { logInfo, logError } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const context = "shopify_webhook_orders_delete";

serve(async (req) => {
  const start = performance.now();
  const path = new URL(req.url).pathname;

  try {
    // NOTE: If you want to add Shopify HMAC verification, scaffold is here

    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);
    const shopifyDomain = req.headers.get("x-shopify-shop-domain") || "";

    if (!payload?.id) {
      logError(context, "Missing order ID", { shopifyDomain });
      return returnJsonError(400, "Missing order ID");
    }

    const { data: store, error: storeError } = await supabase
      .from("shopify_stores")
      .select("id")
      .eq("domain", shopifyDomain)
      .maybeSingle();

    if (storeError || !store) {
      logError(context, "Store not found", { shopifyDomain });
      return returnJsonError(404, "Store not found");
    }

    const shopify_order_id = payload.id.toString();

    const { error: softDeleteError } = await supabase
      .from("shopify_orders")
      .update({ is_deleted: true })
      .eq("shopify_order_id", shopify_order_id)
      .eq("store_id", store.id);

    if (softDeleteError) {
      logError(context, "Order soft delete failed", {
        store_id: store.id,
        shopify_order_id,
        error: softDeleteError.message,
      });
      return returnJsonError(500, "Failed to mark order as deleted");
    }

    const { error: logErrorInsert } = await supabase.from("webhook_logs").insert({
      store_id: store.id,
      topic: "orders/delete",
      shopify_order_id,
      payload,
    });

    if (logErrorInsert) {
      logError(context, "Webhook log failed", {
        store_id: store.id,
        shopify_order_id,
        error: logErrorInsert.message,
      });
    }

    logInfo(context, "Order marked as deleted", {
      store_id: store.id,
      shopify_order_id,
    });

    const duration = performance.now() - start;
    logInfo(context, "Webhook processed", { path, duration_ms: duration });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError(context, err, { path });
    return returnJsonError(500, "Unexpected error during webhook processing");
  }
});
