import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logError, logInfo } from "../_shared/logging.ts";
import "https://deno.land/x/dotenv/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const path = new URL(req.url).pathname;
  const startTime = performance.now();

  try {
    const payload = await req.json();
    const shopifyDomain = req.headers.get("x-shopify-shop-domain") || "";

    const { data: store, error: storeError } = await supabase
      .from("shopify_stores")
      .select("id")
      .eq("domain", shopifyDomain)
      .maybeSingle();

    if (storeError || !store) {
      logError("shopify_webhook_products_delete", "Store not found", { shopifyDomain });
      return returnJsonError(404, "Store not found");
    }

    const shopify_product_id = payload.id?.toString();
    if (!shopify_product_id) {
      return returnJsonError(400, "Missing product ID");
    }

    // 🧼 Soft delete main product record
    const { error: updateProductErr } = await supabase
      .from("shopify_products")
      .update({ is_deleted: true })
      .eq("shopify_product_id", shopify_product_id)
      .eq("store_id", store.id);

    if (updateProductErr) {
      logError("shopify_webhook_products_delete", updateProductErr, {
        shopify_product_id,
        store_id: store.id
      });
      return returnJsonError(500, "Failed to soft-delete product");
    }

    // 🧼 Soft delete variants (if any)
    const { data: product, error: lookupError } = await supabase
      .from("shopify_products")
      .select("id")
      .eq("shopify_product_id", shopify_product_id)
      .eq("store_id", store.id)
      .maybeSingle();

    if (product) {
      await supabase
        .from("shopify_product_variants")
        .update({ is_deleted: true })
        .eq("product_id", product.id)
        .eq("store_id", store.id);
    }

    // 🪵 Log the webhook
    await supabase.from("webhook_logs").insert({
      store_id: store.id,
      topic: "products/delete",
      shopify_product_id,
      payload
    });

    logInfo("shopify_webhook_products_delete", "Product + variants soft deleted", {
      shopify_product_id,
      store_id: store.id
    });

    logInfo("shopify_webhook_products_delete", "Request complete", {
      duration_ms: performance.now() - startTime,
      path
    });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError("shopify_webhook_products_delete", err, { path });
    return returnJsonError(500, "Webhook Error");
  }
});
