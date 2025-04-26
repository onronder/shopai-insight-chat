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
const context = "shopify_delta_products";

interface ShopifyVariant {
  id: number;
  title: string;
  sku?: string;
  price?: string;
  inventory_quantity?: number;
  position?: number;
}

interface ShopifyProduct {
  id: number;
  title: string;
  product_type?: string;
  vendor?: string;
  tags?: string;
  updated_at: string;
  variants: ShopifyVariant[];
}

serve(async (req: Request): Promise<Response> => {
  const startTime = performance.now();
  const path = new URL(req.url).pathname;

  try {
    logInfo(context, "Delta product sync started", { path });

    const { data: stores, error } = await supabase
      .from("shopify_stores")
      .select("id, domain, access_token, sync_finished_at")
      .neq("access_token", null);

    if (error || !stores) {
      logError(context, "Failed to fetch stores", { error });
      return addSecurityHeaders(returnJsonError(500, "Failed to load store list"));
    }

    for (const store of stores) {
      const updatedAt = store.sync_finished_at
        ? `&updated_at_min=${encodeURIComponent(store.sync_finished_at)}`
        : "";

      const baseUrl = `https://${store.domain}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=250${updatedAt}`;
      const headers: HeadersInit = {
        "X-Shopify-Access-Token": store.access_token,
        "Content-Type": "application/json",
      };

      let pageUrl: string | null = baseUrl;
      let productCount = 0;
      const now = new Date().toISOString();

      await supabase
        .from("shopify_stores")
        .update({ sync_started_at: now })
        .eq("id", store.id);

      while (pageUrl) {
        const res: Response = await fetch(pageUrl, { headers });
        if (!res.ok) {
          const errText = await res.text();
          logError(context, "Shopify fetch failed", {
            store: store.domain,
            status: res.status,
            error: errText,
          });
          break;
        }

        const body = await res.json();
        const products: ShopifyProduct[] = body.products ?? [];

        for (const p of products) {
          const {
            id: shopify_product_id,
            title,
            product_type,
            vendor,
            tags,
            updated_at,
            variants,
          } = p;

          const { data: productRecord, error: upsertError } = await supabase
            .from("shopify_products")
            .upsert({
              shopify_product_id: shopify_product_id.toString(),
              title,
              product_type: product_type || null,
              vendor: vendor || null,
              tags: tags ? tags.split(",").map((t) => t.trim()) : [],
              updated_at: updated_at ? new Date(updated_at) : null,
              shopify_synced_at: now,
              store_id: store.id,
            })
            .select("id")
            .single();

          if (upsertError || !productRecord) {
            logError(context, "Product upsert failed", {
              store: store.domain,
              shopify_product_id,
              error: upsertError?.message,
            });
            continue;
          }

          const product_id = productRecord.id;

          for (const variant of variants ?? []) {
            const variantError = await supabase
              .from("shopify_product_variants")
              .upsert({
                shopify_variant_id: variant.id.toString(),
                title: variant.title,
                sku: variant.sku || null,
                price: variant.price ? parseFloat(variant.price) : null,
                inventory_quantity: variant.inventory_quantity ?? null,
                position: variant.position ?? null,
                product_id,
                store_id: store.id,
                shopify_synced_at: now,
              })
              .then((res) => res.error);

            if (variantError) {
              logError(context, "Variant upsert failed", {
                store: store.domain,
                variant_id: variant.id,
                error: variantError.message,
              });
            }
          }

          productCount++;
        }

        const linkHeader: string | null = res.headers.get("link");
        const nextUrlMatch: RegExpMatchArray | null = linkHeader ? linkHeader.match(/<([^>]+)>;\s*rel=next/) : null;
        pageUrl = nextUrlMatch ? nextUrlMatch[1] : null;
      }

      await supabase
        .from("shopify_stores")
        .update({ sync_finished_at: new Date().toISOString() })
        .eq("id", store.id);

      logInfo(context, "Store delta product sync completed", {
        store: store.domain,
        products_synced: productCount,
      });
    }

    const duration = performance.now() - startTime;
    logInfo(context, "Full delta sync completed", { duration_ms: duration });

    return addSecurityHeaders(
      new Response("Delta product sync completed", { status: 200 }),
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logError(context, message, { path });
    return addSecurityHeaders(
      returnJsonError(500, "Unexpected delta product sync error"),
    );
  }
});
