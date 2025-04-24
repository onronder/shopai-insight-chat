// File: shopify_webhook_products_update/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { logError, logInfo } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const context = "shopify_webhook_products_update";

serve(async (req) => {
  const path = new URL(req.url).pathname;
  const start = performance.now();

  try {
    const payload = await req.json();
    const shopifyDomain = req.headers.get("x-shopify-shop-domain")?.trim();

    if (!payload?.id || !shopifyDomain) {
      return returnJsonError(400, "Missing product ID or shop domain");
    }

    const shopify_product_id = payload.id.toString();

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

    // ✅ Update product
    const updateFields = {
      title: payload.title,
      product_type: payload.product_type || null,
      vendor: payload.vendor || null,
      tags: Array.isArray(payload.tags)
        ? payload.tags.join(", ")
        : typeof payload.tags === "string"
        ? payload.tags
        : null,
      shopify_synced_at: new Date().toISOString(),
      is_deleted: false
    };

    const { data: product, error: updateError } = await supabase
      .from("shopify_products")
      .update(updateFields)
      .eq("shopify_product_id", shopify_product_id)
      .eq("store_id", store_id)
      .select("id")
      .single();

    if (updateError || !product) {
      logError(context, "Product update failed", {
        shopify_product_id,
        store_id,
        error: updateError?.message
      });
      return returnJsonError(500, "Failed to update product");
    }

    // ✅ Upsert variants
    for (const v of payload.variants || []) {
      const { error: variantError } = await supabase
        .from("shopify_product_variants")
        .upsert({
          shopify_variant_id: v.id.toString(),
          title: v.title,
          sku: v.sku || null,
          price: v.price ? parseFloat(v.price) : null,
          inventory_quantity: v.inventory_quantity ?? null,
          product_id: product.id,
          store_id,
          shopify_synced_at: new Date().toISOString(),
          is_deleted: false
        });

      if (variantError) {
        logError(context, "Variant update failed", {
          variant_id: v.id,
          store_id,
          error: variantError.message
        });
      }
    }

    // 🪵 Log webhook
    await supabase.from("webhook_logs").insert({
      store_id,
      topic: "products/update",
      shopify_product_id,
      payload
    });

    logInfo(context, "Product + variants updated", {
      shopify_product_id,
      store_id
    });

    logInfo(context, "Request complete", {
      duration_ms: performance.now() - start,
      path
    });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError(context, err, { path });
    return returnJsonError(500, "Webhook Error");
  }
});
