// File: shopify_webhook_products_delete/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logError, logInfo } from "../_shared/logging.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const context = "shopify_webhook_products_delete";

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

    // 🧼 Soft delete product
    const { error: updateProductErr } = await supabase
      .from("shopify_products")
      .update({ is_deleted: true })
      .eq("shopify_product_id", shopify_product_id)
      .eq("store_id", store.id);

    if (updateProductErr) {
      logError(context, "Product update failed", {
        store_id: store.id,
        shopify_product_id,
        error: updateProductErr.message
      });
      return returnJsonError(500, "Failed to soft-delete product");
    }

    // 🧼 Soft delete variants (if any)
    const { data: product } = await supabase
      .from("shopify_products")
      .select("id")
      .eq("shopify_product_id", shopify_product_id)
      .eq("store_id", store.id)
      .maybeSingle();

    if (product?.id) {
      const { error: variantDeleteErr } = await supabase
        .from("shopify_product_variants")
        .update({ is_deleted: true })
        .eq("product_id", product.id)
        .eq("store_id", store.id);

      if (variantDeleteErr) {
        logError(context, "Variant soft delete failed", {
          store_id: store.id,
          product_id: product.id,
          error: variantDeleteErr.message
        });
      }
    }

    // 🪵 Log webhook
    await supabase.from("webhook_logs").insert({
      store_id: store.id,
      topic: "products/delete",
      shopify_product_id,
      payload
    });

    logInfo(context, "Product and variants soft-deleted", {
      shopify_product_id,
      store_id: store.id
    });

    logInfo(context, "Request completed", {
      duration_ms: performance.now() - start,
      path
    });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError(context, err, { path });
    return returnJsonError(500, "Webhook Error");
  }
});
