import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { logInfo, logError } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const SHOPIFY_API_VERSION = Deno.env.get("PROJECT_SHOPIFY_API_VERSION")!;
const context = "shopify_sync_products";

type ShopifyProduct = {
  id: number;
  title: string;
  product_type?: string;
  vendor?: string;
  tags?: string;
  variants: {
    id: number;
    title: string;
    sku?: string;
    price?: string;
    inventory_quantity?: number;
  }[];
};

serve(async (): Promise<Response> => {
  const startTime = performance.now();

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
      const now = new Date().toISOString();

      try {
        await supabase
          .from("stores")
          .update({ sync_status: "syncing", sync_started_at: now })
          .eq("id", store.id);

        const baseUrl = `https://${store.domain}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=250`;
        const headers = {
          "X-Shopify-Access-Token": store.access_token,
          "Content-Type": "application/json",
        };

        let pageUrl: string | null = baseUrl;
        let synced = 0;

        while (pageUrl) {
          const res: Response = await fetch(pageUrl, { headers });
          if (!res.ok) {
            const errorText = await res.text();
            logError(context, "Shopify fetch failed", {
              store: store.domain,
              status: res.status,
              error: errorText,
            });

            await supabase.from("sync_errors").insert({
              store_id: store.id,
              function: context,
              error: `Fetch failed: ${res.status} - ${errorText}`,
              phase: "fetch",
            });

            break;
          }

          const json = await res.json();
          const products: ShopifyProduct[] = json.products;

          for (const product of products) {
            const {
              id: shopify_product_id,
              title,
              product_type,
              vendor,
              tags,
              variants,
            } = product;

            const { data: productRecord, error: insertError } = await supabase
              .from("shopify_products")
              .upsert({
                shopify_product_id: shopify_product_id.toString(),
                title,
                product_type: product_type || null,
                vendor: vendor || null,
                tags: tags || null,
                store_id: store.id,
                shopify_synced_at: new Date().toISOString(),
              })
              .select("id")
              .single();

            if (insertError || !productRecord) {
              logError(context, "Product upsert failed", {
                store: store.domain,
                shopify_product_id,
                error: insertError?.message,
              });

              await supabase.from("sync_errors").insert({
                store_id: store.id,
                function: context,
                error: `Product upsert failed: ${insertError?.message}`,
                phase: "product",
              });

              continue;
            }

            const product_id = productRecord.id;

            for (const v of variants || []) {
              const { error: variantError } = await supabase
                .from("shopify_product_variants")
                .upsert({
                  shopify_variant_id: v.id.toString(),
                  title: v.title,
                  sku: v.sku || null,
                  price: v.price ? parseFloat(v.price) : null,
                  inventory_quantity: v.inventory_quantity ?? null,
                  product_id,
                  store_id: store.id,
                  shopify_synced_at: new Date().toISOString(),
                });

              if (variantError) {
                logError(context, "Variant upsert failed", {
                  store: store.domain,
                  variant_id: v.id,
                  error: variantError.message,
                });

                await supabase.from("sync_errors").insert({
                  store_id: store.id,
                  function: context,
                  error: `Variant upsert failed: ${variantError.message}`,
                  phase: "variant",
                });
              }
            }

            synced++;
          }

          const link: string | null = res.headers.get("link");
          const nextUrl: string | null =
            link?.match(/<([^>]+)>; rel="next"/)?.[1] ?? null;
          pageUrl = nextUrl;
        }

        await supabase
          .from("stores")
          .update({
            sync_status: "completed",
            sync_finished_at: new Date().toISOString(),
          })
          .eq("id", store.id);

        logInfo(context, "Store product sync completed", {
          store: store.domain,
          products_synced: synced,
        });
      } catch (err) {
        await supabase.from("sync_errors").insert({
          store_id: store.id,
          function: context,
          error: err instanceof Error ? err.message : "Unhandled error",
          phase: "top-level",
        });

        await supabase
          .from("stores")
          .update({
            sync_status: "failed",
            sync_finished_at: new Date().toISOString(),
          })
          .eq("id", store.id);

        logError(context, "Unhandled store sync error", {
          store: store.domain,
          error: err,
        });
      }
    }

    logInfo(context, "Full product sync completed", {
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
