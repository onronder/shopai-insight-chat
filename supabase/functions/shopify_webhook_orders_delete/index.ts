// supabase/functions/shopify_webhook_orders_delete/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { logInfo, logError } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";

import "https://deno.land/x/dotenv/load.ts";

const SUPABASE_URL = Deno.env.get("PROJECT_SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

serve(async (req) => {
  const start = performance.now();
  const path = new URL(req.url).pathname;

  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);
    const shopifyDomain = req.headers.get("x-shopify-shop-domain") || "";

    const { data: store, error: storeError } = await supabase
      .from("shopify_stores")
      .select("id")
      .eq("domain", shopifyDomain)
      .maybeSingle();

    if (storeError || !store) {
      logError("shopify_webhook_orders_delete", "Store not found", {
        shopifyDomain,
      });
      return returnJsonError(404, "Store not found");
    }

    const shopify_order_id = payload.id?.toString();
    if (!shopify_order_id) {
      return returnJsonError(400, "Missing order ID");
    }

    const { error: deleteError } = await supabase
      .from("shopify_orders")
      .update({ is_deleted: true })
      .eq("shopify_order_id", shopify_order_id)
      .eq("store_id", store.id);

    if (deleteError) {
      logError("shopify_webhook_orders_delete", deleteError, {
        shopify_order_id,
        store_id: store.id,
      });
      return returnJsonError(500, "Failed to soft delete order");
    }

    const { error: logErr } = await supabase.from("webhook_logs").insert({
      store_id: store.id,
      topic: "orders/delete",
      shopify_order_id,
      payload,
    });

    if (logErr) {
      logError("shopify_webhook_orders_delete", logErr, {
        shopify_order_id,
        store_id: store.id,
      });
    }

    logInfo("shopify_webhook_orders_delete", "Order soft deleted", {
      shopify_order_id,
      store_id: store.id,
    });

    const duration = performance.now() - start;
    logInfo("shopify_webhook_orders_delete", "Request completed", {
      path,
      duration_ms: duration,
    });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError("shopify_webhook_orders_delete", err, { path });
    return returnJsonError(500, "Webhook Error");
  }
});
