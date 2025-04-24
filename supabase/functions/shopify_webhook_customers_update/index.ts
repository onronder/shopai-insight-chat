// File: supabase/functions/shopify_webhook_customers_update/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { logInfo, logError } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const SHOPIFY_SECRET = Deno.env.get("PROJECT_SHOPIFY_API_SECRET")!;
const context = "shopify_webhook_customers_update";

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(b.length === a.length ? i : 0);
  }
  return result === 0;
}

async function verifyShopifyWebhook(req: Request, rawBody: string): Promise<boolean> {
  const receivedHmac = req.headers.get("x-shopify-hmac-sha256") || "";
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SHOPIFY_SECRET);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const expectedHmac = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return constantTimeEqual(receivedHmac, expectedHmac);
}

serve(async (req) => {
  const start = performance.now();
  const path = new URL(req.url).pathname;

  try {
    const rawBody = await req.text();
    if (!(await verifyShopifyWebhook(req, rawBody))) {
      logError(context, "Invalid HMAC signature", { path });
      return addSecurityHeaders(returnJsonError(401, "Unauthorized"));
    }

    const payload = JSON.parse(rawBody);
    const shopifyDomain = req.headers.get("x-shopify-shop-domain") || "";

    logInfo(context, "Received webhook", {
      path,
      shopifyDomain,
      customer_id: payload.id,
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
      logError(context, storeError || "Store not found", { shopifyDomain });
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
      logError(context, updateError, {
        store_id: store.id,
        shopify_customer_id: payload.id,
      });
      return returnJsonError(500, "Failed to update customer");
    }

    await supabase.from("webhook_logs").insert({
      store_id: store.id,
      topic: "customers/update",
      shopify_customer_id: payload.id.toString(),
      payload,
    });

    logInfo(context, "Customer updated", {
      store_id: store.id,
      shopify_customer_id: payload.id,
    });

    const duration = performance.now() - start;
    logInfo(context, "Completed", { duration });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError(context, err, { path });
    return returnJsonError(500, "Webhook Error");
  }
});
