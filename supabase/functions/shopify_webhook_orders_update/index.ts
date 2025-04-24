// File: supabase/functions/shopify_webhook_orders_update/index.ts

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
const CONTEXT = "shopify_webhook_orders_update";

serve(async (req) => {
  const start = performance.now();
  const path = new URL(req.url).pathname;

  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256") || "";
    const shopifyDomain = req.headers.get("x-shopify-shop-domain") || "";

    const isValid = await verifyShopifyHMAC(rawBody, hmacHeader, SHOPIFY_SECRET);
    if (!isValid) {
      logError(CONTEXT, "HMAC verification failed", {
        shop: shopifyDomain,
        ip: req.headers.get("CF-Connecting-IP") || "unknown"
      });
      return returnJsonError(401, "Unauthorized");
    }

    const payload = JSON.parse(rawBody);
    const shopify_order_id = payload?.id?.toString();
    if (!shopify_order_id) {
      return returnJsonError(400, "Missing order ID");
    }

    const { data: store, error: storeError } = await supabase
      .from("shopify_stores")
      .select("id")
      .eq("domain", shopifyDomain)
      .maybeSingle();

    if (storeError || !store) {
      logError(CONTEXT, "Store not found", { shopifyDomain });
      return returnJsonError(404, "Store not found");
    }

    const store_id = store.id;

    const updateFields = {
      total_price: parseFloat(payload.total_price),
      subtotal_price: parseFloat(payload.subtotal_price),
      total_discount: parseFloat(payload.total_discounts),
      currency: payload.currency,
      financial_status: payload.financial_status,
      fulfillment_status: payload.fulfillment_status,
      processed_at: payload.processed_at ? new Date(payload.processed_at) : null,
      shopify_synced_at: new Date()
    };

    const { error: updateErr } = await supabase
      .from("shopify_orders")
      .update(updateFields)
      .eq("shopify_order_id", shopify_order_id)
      .eq("store_id", store_id);

    if (updateErr) {
      logError(CONTEXT, "Order update failed", {
        store_id,
        shopify_order_id,
        error: updateErr.message
      });
      return returnJsonError(500, "Failed to update order");
    }

    for (const item of payload.line_items ?? []) {
      await supabase.from("shopify_order_line_items").upsert({
        store_id,
        order_id: null,
        shopify_order_id,
        product_id: null,
        variant_id: null,
        title: item.title,
        quantity: item.quantity,
        price: parseFloat(item.price),
        discount: parseFloat(item.total_discount ?? 0)
      });
    }

    await supabase.from("webhook_logs").insert({
      store_id,
      topic: "orders/update",
      shopify_order_id,
      payload
    });

    logInfo(CONTEXT, "Order updated", {
      store_id,
      shopify_order_id
    });

    const duration = performance.now() - start;
    logInfo(CONTEXT, "Completed", { path, duration_ms: duration });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError(CONTEXT, err, { path });
    return returnJsonError(500, "Webhook Error");
  }
});
