// File: supabase/functions/shopify_webhook_orders_create/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createHmac } from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logInfo, logError } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import "https://deno.land/x/dotenv/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const SHOPIFY_API_SECRET = Deno.env.get("PROJECT_SHOPIFY_API_SECRET")!;

serve(async (req) => {
  const start = performance.now();
  const path = new URL(req.url).pathname;

  try {
    const rawBody = await req.text();
    const shopifyDomain = req.headers.get("X-Shopify-Shop-Domain") || "";
    const hmacHeader = req.headers.get("X-Shopify-Hmac-Sha256") || "";

    // HMAC validation
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
      return returnJsonError(401, "Unauthorized");
    }

    const payload = JSON.parse(rawBody);
    const orderId = payload?.id;

    const { data: store, error: storeError } = await supabase
      .from("shopify_stores")
      .select("id")
      .eq("domain", shopifyDomain)
      .maybeSingle();

    if (storeError || !store) {
      return returnJsonError(404, "Store not found");
    }

    const store_id = store.id;

    // Step 1: Optional Customer Upsert
    let customer_id = null;
    if (payload.customer?.id) {
      const { data: cRecord } = await supabase
        .from("shopify_customers")
        .upsert({
          shopify_customer_id: payload.customer.id.toString(),
          email: payload.customer.email,
          first_name: payload.customer.first_name,
          last_name: payload.customer.last_name,
          store_id
        })
        .select("id")
        .single();

      customer_id = cRecord?.id || null;
    }

    // Step 2: Order Upsert
    const {
      total_price,
      subtotal_price,
      total_discounts,
      currency,
      financial_status,
      fulfillment_status,
      created_at,
      processed_at
    } = payload;

    const { data: orderRecord, error: orderError } = await supabase
      .from("shopify_orders")
      .upsert({
        shopify_order_id: orderId.toString(),
        store_id,
        customer_id,
        total_price: parseFloat(total_price),
        subtotal_price: parseFloat(subtotal_price),
        total_discount: parseFloat(total_discounts),
        currency,
        financial_status,
        fulfillment_status,
        created_at: new Date(created_at),
        processed_at: new Date(processed_at)
      })
      .select("id")
      .single();

    if (orderError || !orderRecord) {
      logError("webhook_orders_create", orderError, { orderId });
      return returnJsonError(500, "Failed to save order");
    }

    // Step 3: Line Items
    const order_id = orderRecord.id;

    for (const item of payload.line_items || []) {
      await supabase.from("shopify_order_line_items").upsert({
        store_id,
        order_id,
        product_id: null,
        variant_id: null,
        title: item.title,
        quantity: item.quantity,
        price: parseFloat(item.price),
        discount: parseFloat(item.total_discount || 0)
      });
    }

    // Step 4: Log Webhook
    await supabase.from("webhook_logs").insert({
      store_id,
      topic: "orders/create",
      shopify_order_id: orderId.toString(),
      payload
    });

    logInfo("webhook_orders_create", "Completed", {
      store_id,
      orderId,
      duration_ms: performance.now() - start
    });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError("webhook_orders_create", err, { path });
    return returnJsonError(500, "Webhook Error");
  }
});
