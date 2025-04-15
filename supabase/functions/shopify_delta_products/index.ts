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

serve(async (req) => {
  const startTime = performance.now();
  const path = new URL(req.url).pathname;

  try {
    logInfo("shopify_delta_products", "Sync started", { path });

    const { data: stores, error } = await supabase
      .from("shopify_stores")
      .select("id, domain, access_token, sync_finished_at")
      .neq("access_token", null);

    if (error || !stores) {
      logError("shopify_delta_products", error, {});
      return addSecurityHeaders(returnJsonError(500, "Failed to load store list"));
    }

    for (const store of stores) {
      const updatedAt = store.sync_finished_at
        ? `&updated_at_min=${encodeURIComponent(store.sync_finished_at)}`
        : "";

      const baseUrl = `https://${store.domain}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=250${updatedAt}`;
      const headers = {
        "X-Shopify-Access-Token": store.access_token,
        "Content-Type": "application/json",
      };

      let pageUrl = baseUrl;
      let productCount = 0;

      await supabase
        .from("shopify_stores")
        .update({ sync_started_at: new Date().toISOString() })
        .eq("id", store.id);

      while (pageUrl) {
        const res = await fetch(pageUrl, { headers });
        if (!res.ok) {
          const errText = await res.text();
          logError("shopify_delta_products", errText, { store: store.domain });
          break;
        }

        const json = await res.json();
        const products = json.products;

        for (const p of products) {
          const { id: shopify_product_id, title, variants } = p;

          const { data: prod, error: insertError } = await supabase
            .from("shopify_products")
            .upsert({
              shopify_product_id: shopify_product_id.toString(),
              title,
              store_id: store.id,
            })
            .select("id")
            .single();

          if (insertError || !prod) {
            logError("shopify_delta_products", insertError?.message, {
              shopify_product_id,
              store_id: store.id,
            });
            continue;
          }

          const product_id = prod.id;

          for (const v of variants || []) {
            const variantUpsertError = await supabase
              .from("shopify_product_variants")
              .upsert({
                shopify_variant_id: v.id.toString(),
                title: v.title,
                sku: v.sku,
                price: v.price ? parseFloat(v.price) : null,
                inventory_quantity: v.inventory_quantity ?? null,
                product_id,
                store_id: store.id,
              })
              .then((res) => res.error);

            if (variantUpsertError) {
              logError("shopify_delta_products", variantUpsertError.message, {
                variant_id: v.id,
                store_id: store.id,
              });
            }
          }

          productCount++;
        }

        const link = res.headers.get("link");
        const nextUrl = link?.match(/<([^>]+)>; rel="next"/)?.[1];
        pageUrl = nextUrl || null;
      }

      await supabase
        .from("shopify_stores")
        .update({ sync_finished_at: new Date().toISOString() })
        .eq("id", store.id);

      logInfo("shopify_delta_products", "Store sync completed", {
        store: store.domain,
        productCount,
      });
    }

    const duration = performance.now() - startTime;
    logInfo("shopify_delta_products", "Full sync completed", { duration_ms: duration });

    return addSecurityHeaders(new Response("Delta product sync completed", { status: 200 }));
  } catch (err) {
    logError("shopify_delta_products", err, { path });
    return addSecurityHeaders(returnJsonError(500, "Unexpected error occurred"));
  }
});
