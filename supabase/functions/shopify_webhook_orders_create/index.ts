// supabase/functions/shopify_webhook_orders_create/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
//import { createHmac } from "https://deno.land/std@0.177.0/hash/mod.ts";
import "https://deno.land/x/dotenv/load.ts";

serve(async (req) => {
  const rawBody = await req.text();
  const hmacHeader = req.headers.get("X-Shopify-Hmac-Sha256");
  const shopDomain = req.headers.get("X-Shopify-Shop-Domain");

  const apiSecret = Deno.env.get("SHOPIFY_API_SECRET") || "";
  const generatedHmac = createHmac("sha256", apiSecret)
    .update(rawBody)
    .toString("base64");

  if (generatedHmac !== hmacHeader) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const orderId = payload?.id;
  const shopifyDomain = shopDomain || payload?.store_domain || "";

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Optional: Save webhook info or trigger sync (simple logging now)
  const { data, error } = await supabase
    .from("webhook_logs")
    .insert({
      type: "orders_create",
      shopify_order_id: orderId,
      store_domain: shopifyDomain,
      raw_payload: payload,
    });

  if (error) {
    console.error("Error saving webhook:", error);
    return new Response("Error", { status: 500 });
  }

  return new Response("Webhook received", { status: 200 });
});
