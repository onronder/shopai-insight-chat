import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logInfo, logError } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import "https://deno.land/x/dotenv/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const SHOPIFY_API_VERSION = Deno.env.get("PROJECT_SHOPIFY_API_VERSION")!;

serve(async () => {
  const startTime = performance.now();
  const context = "shopify_sync_products";

  try {
    logInfo(context, "Sync started");

    const { data: stores, error } = await supabase
      .from("shopify_stores")
      .select("id, domain, access_token")
      .neq("access_token", null);

    if (error || !stores) {
      logError(context, "Failed to fetch stores", { error });
      return addSecurityHeaders(returnJsonError(500, "Error loading stores"));
    }

    for (const store of stores) {
      const baseUrl = `https://${store.domain}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=250`;
      const headers = {
        "X-Shopify-Access-Token": store.access_token,
        "Content-Type": "application/json",
      };

      let pageUrl: string | null = baseUrl;
      let synced = 0;

      while (pageUrl) {
        const res = await fetch(pageUrl, { headers });
        if (!res.ok) {
          const errorText = await res.text();
          logError(context, "Shopify fetch failed", {
            store: store.domain,
            status: res.status,
            error: errorText,
          });
          break;
        }

        const { products } = await res.json();

        for (const p of products) {
          const { id: shopify_product_id, title, variants } = p;

          const { data: product, error: insertError } = await supabase
            .from("shopify_products")
            .upsert({
              shopify_product_id: shopify_product_id.toString(),
              title,
              store_id: store.id,
            })
            .select("id")
            .single();

          if (insertError || !product) {
            logError(context, "Product upsert failed", {
              product_id: shopify_product_id,
              error: insertError?.message,
            });
            continue;
          }

          const product_id = product.id;

          for (const v of variants || []) {
            await supabase.from("shopify_product_variants").upsert({
              shopify_variant_id: v.id.toString(),
              title: v.title,
              sku: v.sku,
              price: v.price ? parseFloat(v.price) : null,
              inventory_quantity: v.inventory_quantity ?? null,
              product_id,
              store_id: store.id,
            });
          }

          synced++;
        }

        const link = res.headers.get("link");
        const nextUrl = link?.match(/<([^>]+)>; rel="next"/)?.[1];
        pageUrl = nextUrl || null;
      }

      logInfo(context, "Store product sync completed", {
        store: store.domain,
        products_synced: synced,
      });
    }

    logInfo(context, "Full sync completed", {
      duration_ms: performance.now() - startTime,
    });

    return addSecurityHeaders(
      new Response("Shopify product sync completed", { status: 200 })
    );
  } catch (err) {
    logError(context, err);
    return addSecurityHeaders(returnJsonError(500, "Sync failed"));
  }
});