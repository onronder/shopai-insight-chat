// File: supabase/functions/shopify_webhook_products_update/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logError, logInfo } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import "https://deno.land/x/dotenv/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const path = new URL(req.url).pathname;
  const start = performance.now();

  try {
    const payload = await req.json();
    const shopifyDomain = req.headers.get("x-shopify-shop-domain") || "";

    const { data: store, error: storeError } = await supabase
      .from("shopify_stores")
      .select("id")
      .eq("domain", shopifyDomain)
      .maybeSingle();

    if (storeError || !store) {
      logError("shopify_webhook_products_update", "Store not found", { shopifyDomain });
      return returnJsonError(404, "Store not found");
    }

    const shopify_product_id = payload.id?.toString();
    if (!shopify_product_id) {
      return returnJsonError(400, "Missing product ID");
    }

    const updateFields = {
      title: payload.title,
      product_type: payload.product_type || null,
      vendor: payload.vendor || null,
      tags: Array.isArray(payload.tags)
        ? payload.tags.join(", ")
        : typeof payload.tags === "string"
        ? payload.tags
        : null,
      shopify_synced_at: new Date().toISOString()
    };

    const { data: product, error: updateError } = await supabase
      .from("shopify_products")
      .update(updateFields)
      .eq("shopify_product_id", shopify_product_id)
      .eq("store_id", store.id)
      .select("id")
      .single();

    if (updateError || !product) {
      logError("shopify_webhook_products_update", updateError, {
        shopify_product_id,
        store_id: store.id,
      });
      return returnJsonError(500, "Failed to update product");
    }

    for (const v of payload.variants || []) {
      await supabase.from("shopify_product_variants").upsert({
        shopify_variant_id: v.id.toString(),
        title: v.title,
        sku: v.sku,
        price: v.price ? parseFloat(v.price) : null,
        inventory_quantity: v.inventory_quantity ?? null,
        product_id: product.id,
        store_id: store.id,
        is_deleted: false
      });
    }

    await supabase.from("webhook_logs").insert({
      store_id: store.id,
      topic: "products/update",
      shopify_product_id,
      payload,
    });

    logInfo("shopify_webhook_products_update", "Product + variants updated", {
      shopify_product_id,
      store_id: store.id,
    });

    logInfo("shopify_webhook_products_update", "Request complete", {
      duration_ms: performance.now() - start,
      path,
    });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError("shopify_webhook_products_update", err, {
      path: new URL(req.url).pathname,
    });

    return returnJsonError(500, "Webhook Error");
  }
});
