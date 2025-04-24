// File: supabase/functions/shopify_webhook_products_create/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { logError, logInfo } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { verifyShopifyHMAC } from "../_shared/verifyHMAC.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const SHOPIFY_SECRET = Deno.env.get("PROJECT_SHOPIFY_API_SECRET")!;
const CONTEXT = "shopify_webhook_products_create";

serve(async (req) => {
  const start = performance.now();
  const path = new URL(req.url).pathname;

  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256") || "";
    const shopifyDomain = req.headers.get("x-shopify-shop-domain")?.trim();

    // Verify HMAC
    const isValid = await verifyShopifyHMAC(rawBody, hmacHeader, SHOPIFY_SECRET);
    if (!isValid) {
      logError(CONTEXT, "HMAC verification failed", {
        shop: shopifyDomain,
        ip: req.headers.get("cf-connecting-ip") || "unknown",
      });
      return returnJsonError(401, "Unauthorized");
    }

    const payload = JSON.parse(rawBody);
    const shopify_product_id = payload?.id?.toString();
    if (!shopify_product_id || !shopifyDomain) {
      return returnJsonError(400, "Missing required product ID or shop domain");
    }

    const { data: store, error: storeError } = await supabase
      .from("shopify_stores")
      .select("id")
      .eq("domain", shopifyDomain)
      .maybeSingle();

    if (storeError || !store) {
      logError(CONTEXT, "Store not found", { shopifyDomain });
      return returnJsonError(404, "Store not found");
    }

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
      logError(CONTEXT, "Product upsert failed", {
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
        logError(CONTEXT, "Variant upsert failed", {
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

    logInfo(CONTEXT, "Product and variants synced", {
      store_id: store.id,
      shopify_product_id,
    });

    logInfo(CONTEXT, "Request completed", {
      path,
      duration_ms: performance.now() - start,
    });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError(CONTEXT, err, { path });
    return returnJsonError(500, "Webhook Error");
  }
});
