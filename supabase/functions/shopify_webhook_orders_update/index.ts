// supabase/functions/shopify_webhook_orders_update/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/dotenv/load.ts";

serve(async (req) => {
  try {
    const payload = await req.json();
    const storeDomain = req.headers.get("x-shopify-shop-domain") || "";
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: store } = await supabase
      .from("shopify_stores")
      .select("id")
      .eq("domain", storeDomain)
      .single();

    if (!store) {
      return new Response("Store not found", { status: 404 });
    }

    const update = {
      shopify_order_id: payload.id?.toString(),
      total_price: payload.total_price,
      subtotal_price: payload.subtotal_price,
      total_discount: payload.total_discounts,
      currency: payload.currency,
      financial_status: payload.financial_status,
      fulfillment_status: payload.fulfillment_status,
      processed_at: payload.processed_at,
    };

    await supabase
      .from("shopify_orders")
      .update(update)
      .eq("shopify_order_id", payload.id?.toString())
      .eq("store_id", store.id);

    await supabase.from("webhook_logs").insert({
      store_id: store.id,
      topic: "orders/update",
      payload,
    });

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook Error:", err);
    return new Response("Webhook Error", { status: 500 });
  }
});
