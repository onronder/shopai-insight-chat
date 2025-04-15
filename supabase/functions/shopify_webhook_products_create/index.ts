// supabase/functions/shopify_webhook_products_create/index.ts

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
    const raw = await req.text();
    const payload = JSON.parse(raw);
    const shopifyDomain = req.headers.get("x-shopify-shop-domain") || "";

    const { data: store, error: storeError } = await supabase
      .from("shopify_stores")
      .select("id")
      .eq("domain", shopifyDomain)
      .maybeSingle();

    if (storeError || !store) {
      logError("shopify_webhook_products_create", "Store not found", { shopifyDomain });
      return returnJsonError(404, "Store not found");
    }

    const shopify_product_id = payload.id?.toString();
    if (!shopify_product_id) {
      return returnJsonError(400, "Missing product ID");
    }

    const { data: product, error: productError } = await supabase
      .from("shopify_products")
      .upsert({
        shopify_product_id,
        title: payload.title,
        store_id: store.id,
      })
      .select("id")
      .single();

    if (productError || !product) {
      logError("shopify_webhook_products_create", productError, {
        shopify_product_id,
        store_id: store.id,
      });
      return returnJsonError(500, "Failed to upsert product");
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
      });
    }

    await supabase.from("webhook_logs").insert({
      store_id: store.id,
      topic: "products/create",
      shopify_product_id,
      payload,
    });

    logInfo("shopify_webhook_products_create", "Product created via webhook", {
      store_id: store.id,
      shopify_product_id,
    });

    logInfo("shopify_webhook_products_create", "Request complete", {
      path,
      duration_ms: performance.now() - start,
    });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError("shopify_webhook_products_create", err, { path });
    return returnJsonError(500, "Webhook Error");
  }
});
