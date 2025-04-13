import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/dotenv/load.ts";

serve(async (req) => {
  try {
    const payload = await req.json();
    const shopifyDomain = req.headers.get("x-shopify-shop-domain") || "";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: store, error: storeError } = await supabase
      .from("shopify_stores")
      .select("id")
      .eq("domain", shopifyDomain)
      .maybeSingle();

    if (storeError || !store) {
      console.error("Store not found for product create webhook");
      return new Response("Store not found", { status: 404 });
    }

    const shopify_product_id = payload.id.toString();

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
      console.error("Product insert failed:", productError?.message);
      return new Response("Insert failed", { status: 500 });
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

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Product Create Webhook Error:", err);
    return new Response("Webhook Error", { status: 500 });
  }
});
