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
      console.error("Store not found for product delete webhook");
      return new Response("Store not found", { status: 404 });
    }

    const shopify_product_id = payload.id.toString();

    await supabase
      .from("shopify_products")
      .update({ is_deleted: true })
      .eq("shopify_product_id", shopify_product_id)
      .eq("store_id", store.id);

    await supabase.from("webhook_logs").insert({
      store_id: store.id,
      topic: "products/delete",
      shopify_product_id,
      payload,
    });

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Product Delete Webhook Error:", err);
    return new Response("Webhook Error", { status: 500 });
  }
});
