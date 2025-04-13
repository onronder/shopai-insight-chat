import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/dotenv/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const SHOPIFY_API_VERSION = Deno.env.get("PROJECT_SHOPIFY_API_VERSION")!;


serve(async () => {
  const { data: stores, error } = await supabase
    .from("shopify_stores")
    .select("id, domain, access_token")
    .neq("access_token", null);

  if (error) {
    console.error("Failed to load stores:", error.message);
    return new Response("Error loading stores", { status: 500 });
  }

  for (const store of stores) {
    const productsUrl = `https://${store.domain}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=250`;
    const headers = {
      "X-Shopify-Access-Token": store.access_token,
      "Content-Type": "application/json",
    };

    let pageUrl = productsUrl;
    let page = 1;

    while (pageUrl) {
      const res = await fetch(pageUrl, { headers });
      if (!res.ok) {
        console.error(`[Store ${store.domain}] Fetch failed:`, await res.text());
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
          console.error("Failed to upsert product:", insertError?.message);
          continue;
        }

        const product_id = prod.id;

        for (const v of variants) {
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
      }

      const link = res.headers.get("link");
      const nextUrl = link?.match(/<([^>]+)>; rel="next"/)?.[1];
      pageUrl = nextUrl || null;
      page++;
    }
  }

  return new Response("Product sync completed", { status: 200 });
});
