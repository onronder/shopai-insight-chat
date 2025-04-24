// File: supabase/functions/shopify_webhook_products_create/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { logError, logInfo } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const context = "shopify_webhook_products_create";

serve(async (req) => {
  const start = performance.now();
  const path = new URL(req.url).pathname;

  try {
    const raw = await req.text();
    const payload = JSON.parse(raw);
    const shopifyDomain = req.headers.get("x-shopify-shop-domain")?.trim();

    if (!payload?.id || !shopifyDomain) {
      return returnJsonError(400, "Missing required product ID or shop domain");
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

    const shopify_product_id = payload.id.toString();
    const now = new Date().toISOString();

    const { data: product, error: productError } = await supabase
      .from("shopify_products")
      .upsert({
        shopify_product_id,
        title: payload.title,
        product_type: payload.product_type || null,
        vendor: payload.vendor || null,
        tags: payload.tags || null,
        shopify_synced_at: now,
        store_id: store.id,
      })
      .select("id")
      .single();

    if (productError || !product) {
      logError(context, "Product upsert failed", {
        shopify_product_id,
        store_id: store.id,
        error: productError?.message,
      });
      return returnJsonError(500, "Product upsert failed");
    }

    for (const v of payload.variants ?? []) {
      if (!v.id) continue;

      const variantError = await supabase
        .from("shopify_product_variants")
        .upsert({
          shopify_variant_id: v.id.toString(),
          title: v.title,
          sku: v.sku ?? null,
          price: v.price ? parseFloat(v.price) : null,
          inventory_quantity: v.inventory_quantity ?? null,
          product_id: product.id,
          store_id: store.id,
          shopify_synced_at: now,
        })
        .then((res) => res.error);

      if (variantError) {
        logError(context, "Variant upsert failed", {
          variant_id: v.id,
          product_id: product.id,
          error: variantError.message,
        });
      }
    }

    await supabase.from("webhook_logs").insert({
      store_id: store.id,
      topic: "products/create",
      shopify_product_id,
      payload,
    });

    logInfo(context, "Product and variants synced", {
      store_id: store.id,
      shopify_product_id,
    });

    const duration = performance.now() - start;
    logInfo(context, "Request completed", { path, duration_ms: duration });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError(context, err, { path });
    return returnJsonError(500, "Webhook Error");
  }
});
