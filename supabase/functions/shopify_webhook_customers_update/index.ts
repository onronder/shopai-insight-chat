// File: supabase/functions/shopify_webhook_customers_update/index.ts

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
const CONTEXT = "shopify_webhook_customers_update";

serve(async (req) => {
  const start = performance.now();
  const path = new URL(req.url).pathname;

  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256") || "";

    const isValid = await verifyShopifyHMAC(rawBody, hmacHeader, SHOPIFY_SECRET);
    if (!isValid) {
      logError(CONTEXT, "HMAC verification failed", {
        path,
        shop: req.headers.get("x-shopify-shop-domain") || "unknown",
        ip: req.headers.get("CF-Connecting-IP") || "unknown"
      });
      return addSecurityHeaders(returnJsonError(401, "Unauthorized"));
    }

    const payload = JSON.parse(rawBody);
    const shopifyDomain = req.headers.get("x-shopify-shop-domain") || "";

    logInfo(CONTEXT, "Webhook received", {
      path,
      shopifyDomain,
      customer_id: payload.id
    });

    if (!payload.id) {
      return returnJsonError(400, "Missing customer ID");
    }

    const { data: store, error: storeError } = await supabase
      .from("shopify_stores")
      .select("id")
      .eq("domain", shopifyDomain)
      .maybeSingle();

    if (storeError || !store) {
      logError(CONTEXT, storeError || "Store not found", { shopifyDomain });
      return returnJsonError(404, "Store not found");
    }

    const updateFields = {
      email: payload.email ?? null,
      first_name: payload.first_name ?? null,
      last_name: payload.last_name ?? null,
      phone: payload.phone ?? null,
      tags: payload.tags ?? null,
      orders_count: payload.orders_count ?? null,
      total_spent: payload.total_spent ? parseFloat(payload.total_spent) : null,
      verified_email: payload.verified_email ?? null,
      last_order_at: payload.last_order_created_at ?? null,
      source_updated_at: payload.updated_at ? new Date(payload.updated_at) : null,
      shopify_synced_at: new Date()
    };

    const { error: updateError } = await supabase
      .from("shopify_customers")
      .update(updateFields)
      .eq("shopify_customer_id", payload.id.toString())
      .eq("store_id", store.id);

    if (updateError) {
      logError(CONTEXT, updateError, {
        store_id: store.id,
        shopify_customer_id: payload.id
      });
      return returnJsonError(500, "Failed to update customer");
    }

    await supabase.from("webhook_logs").insert({
      store_id: store.id,
      topic: "customers/update",
      shopify_customer_id: payload.id.toString(),
      payload
    });

    logInfo(CONTEXT, "Customer updated", {
      store_id: store.id,
      shopify_customer_id: payload.id
    });

    logInfo(CONTEXT, "Completed", {
      path,
      duration_ms: performance.now() - start
    });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError(CONTEXT, err, { path });
    return returnJsonError(500, "Webhook Error");
  }
});
