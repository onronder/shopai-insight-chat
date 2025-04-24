// File: supabase/functions/shopify_webhook_orders_create/index.ts

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
const CONTEXT = "shopify_webhook_orders_create";

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
        path,
        shop: shopifyDomain,
        ip: req.headers.get("CF-Connecting-IP") || "unknown"
      });
      return addSecurityHeaders(returnJsonError(401, "Unauthorized"));
    }

    const payload = JSON.parse(rawBody);
    const orderId = payload?.id?.toString();

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

    // ✅ Step 1: Customer Upsert
    let customer_id: string | null = null;
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
      customer_id = cRecord?.id ?? null;
    }

    // ✅ Step 2: Order Upsert
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
        shopify_order_id: orderId,
        store_id,
        customer_id,
        total_price: parseFloat(total_price),
        subtotal_price: parseFloat(subtotal_price),
        total_discount: parseFloat(total_discounts),
        currency,
        financial_status,
        fulfillment_status,
        created_at: created_at ? new Date(created_at) : null,
        processed_at: processed_at ? new Date(processed_at) : null,
        shopify_synced_at: new Date()
      })
      .select("id")
      .single();

    if (orderError || !orderRecord) {
      logError(CONTEXT, orderError, { orderId });
      return returnJsonError(500, "Failed to save order");
    }

    const order_id = orderRecord.id;

    // ✅ Step 3: Line Items Upsert
    for (const item of payload.line_items || []) {
      await supabase.from("shopify_order_line_items").upsert({
        store_id,
        order_id,
        product_id: item.product_id?.toString() ?? null,
        variant_id: item.variant_id?.toString() ?? null,
        title: item.title,
        quantity: item.quantity,
        price: parseFloat(item.price),
        discount: parseFloat(item.total_discount ?? 0)
      });
    }

    // ✅ Step 4: Webhook Logging
    await supabase.from("webhook_logs").insert({
      store_id,
      topic: "orders/create",
      shopify_order_id: orderId,
      payload
    });

    logInfo(CONTEXT, "Order + line items processed", {
      store_id,
      orderId,
      duration_ms: performance.now() - start
    });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError(CONTEXT, err, { path });
    return returnJsonError(500, "Webhook Error");
  }
});
