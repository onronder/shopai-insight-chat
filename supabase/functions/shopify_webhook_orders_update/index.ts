// File: supabase/functions/shopify_webhook_orders_update/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { logInfo, logError } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const SHOPIFY_API_SECRET = Deno.env.get("PROJECT_SHOPIFY_API_SECRET")!;
const context = "shopify_webhook_orders_update";

serve(async (req) => {
  const start = performance.now();
  const path = new URL(req.url).pathname;

  try {
    const rawBody = await req.text();
    const shopifyDomain = req.headers.get("X-Shopify-Shop-Domain") || "";
    const hmacHeader = req.headers.get("X-Shopify-Hmac-Sha256") || "";

    // ✅ HMAC Validation
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SHOPIFY_API_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
    const generatedHmac = btoa(String.fromCharCode(...new Uint8Array(signature)));

    if (generatedHmac !== hmacHeader) {
      logError(context, "HMAC mismatch", { shopifyDomain });
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
      logError(context, "Store not found", { shopifyDomain });
      return returnJsonError(404, "Store not found");
    }

    const store_id = store.id;

    // ✅ Update Order
    const updateFields = {
      total_price: parseFloat(payload.total_price),
      subtotal_price: parseFloat(payload.subtotal_price),
      total_discount: parseFloat(payload.total_discounts),
      currency: payload.currency,
      financial_status: payload.financial_status,
      fulfillment_status: payload.fulfillment_status,
      processed_at: payload.processed_at ? new Date(payload.processed_at) : null,
      shopify_synced_at: new Date().toISOString()
    };

    const { error: updateErr } = await supabase
      .from("shopify_orders")
      .update(updateFields)
      .eq("shopify_order_id", shopify_order_id)
      .eq("store_id", store_id);

    if (updateErr) {
      logError(context, "Order update failed", { store_id, shopify_order_id, error: updateErr.message });
      return returnJsonError(500, "Failed to update order");
    }

    // ✅ Upsert Line Items (no order_id resolved here, only shopify_order_id)
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

    // ✅ Log Webhook
    await supabase.from("webhook_logs").insert({
      store_id,
      topic: "orders/update",
      shopify_order_id,
      payload
    });

    logInfo(context, "Order updated", { store_id, shopify_order_id });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError(context, err, { path });
    return returnJsonError(500, "Webhook Error");
  } finally {
    const duration = performance.now() - start;
    logInfo(context, "Completed", { path, duration_ms: duration });
  }
});
