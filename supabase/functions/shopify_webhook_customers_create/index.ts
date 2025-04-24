// File: supabase/functions/shopify_webhook_customers_create/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logInfo, logError } from "../_shared/logging.ts";
import { verifyShopifyHMAC } from "../_shared/verifyHMAC.ts";

const CONTEXT = "shopify_webhook_customers_create";
const SHOPIFY_API_SECRET = Deno.env.get("PROJECT_SHOPIFY_API_SECRET")!;
const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const startTime = performance.now();
  const path = new URL(req.url).pathname;

  try {
    logInfo(CONTEXT, "Webhook received", { path });

    const rawBody = await req.text();
    const hmacHeader = req.headers.get("X-Shopify-Hmac-Sha256") || "";
    const shopifyDomain = req.headers.get("x-shopify-shop-domain") || "";

    // HMAC Validation
    const isDev = Deno.env.get("ENV") === "dev";
    if (!isDev) {
      const isValid = await verifyShopifyHMAC(rawBody, hmacHeader, SHOPIFY_API_SECRET);
      if (!isValid) {
        logError(CONTEXT, "HMAC verification failed", {
          shop: shopifyDomain,
          ip: req.headers.get("CF-Connecting-IP") || "unknown",
        });
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      logInfo(CONTEXT, "Development mode: skipping HMAC verification");
    }

    const payload = JSON.parse(rawBody);

    const { data: store, error: storeError } = await supabase
      .from("shopify_stores")
      .select("id")
      .eq("domain", shopifyDomain)
      .maybeSingle();

    if (storeError || !store) {
      logError(CONTEXT, storeError || "Store not found", { shopifyDomain });
      return addSecurityHeaders(returnJsonError(404, "Store not found"));
    }

    const customerData = {
      shopify_customer_id: payload.id?.toString(),
      email: payload.email || null,
      first_name: payload.first_name || null,
      last_name: payload.last_name || null,
      phone: payload.phone || null,
      verified_email: payload.verified_email ?? null,
      store_id: store.id,
      source_updated_at: payload.updated_at ? new Date(payload.updated_at) : null,
      shopify_synced_at: new Date(),
    };

    const { error: upsertError } = await supabase
      .from("shopify_customers")
      .upsert(customerData)
      .select("id")
      .single();

    if (upsertError) {
      logError(CONTEXT, upsertError.message, {
        customer_id: payload.id,
        store_id: store.id,
      });
      return addSecurityHeaders(returnJsonError(500, "Upsert failed"));
    }

    await supabase.from("webhook_logs").insert({
      store_id: store.id,
      topic: "customers/create",
      shopify_customer_id: payload.id?.toString(),
      payload,
    });

    logInfo(CONTEXT, "Customer created or updated", {
      store_id: store.id,
      shopify_customer_id: payload.id?.toString(),
    });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError(CONTEXT, err, { path });
    return addSecurityHeaders(returnJsonError(500, "Webhook Error"));
  } finally {
    const duration = performance.now() - startTime;
    logInfo(CONTEXT, "Completed", { path, duration });
  }
});
