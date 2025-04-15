// File: supabase/functions/shopify_webhook_customers_update/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logInfo, logError } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import "https://deno.land/x/dotenv/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const start = performance.now();
  const path = new URL(req.url).pathname;

  try {
    const payload = await req.json();
    const shopifyDomain = req.headers.get("x-shopify-shop-domain") || "";

    logInfo("shopify_webhook_customers_update", "Received webhook", {
      shopifyDomain,
      path,
    });

    if (!payload.id) {
      return returnJsonError(400, "Missing customer ID");
    }

    const { data: store, error: storeError } = await supabase
      .from("shopify_stores")
      .select("id")
      .eq("domain", shopifyDomain)
      .maybeSingle();

    if (storeError || !store) {
      logError("shopify_webhook_customers_update", storeError || "Store not found", {
        shopifyDomain,
      });
      return returnJsonError(404, "Store not found");
    }

    const updateFields = {
      email: payload.email,
      first_name: payload.first_name,
      last_name: payload.last_name,
    };

    const { error: updateError } = await supabase
      .from("shopify_customers")
      .update(updateFields)
      .eq("shopify_customer_id", payload.id.toString())
      .eq("store_id", store.id);

    if (updateError) {
      logError("shopify_webhook_customers_update", updateError, {
        store_id: store.id,
        shopify_customer_id: payload.id,
      });
      return returnJsonError(500, "Failed to update customer");
    }

    await supabase.from("webhook_logs").insert({
      store_id: store.id,
      topic: "customers/update",
      shopify_customer_id: payload.id.toString(),
      payload,
    });

    logInfo("shopify_webhook_customers_update", "Customer updated", {
      store_id: store.id,
      shopify_customer_id: payload.id,
    });

    const duration = performance.now() - start;
    logInfo("shopify_webhook_customers_update", "Completed", { duration });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError("shopify_webhook_customers_update", err, { path });
    return returnJsonError(500, "Webhook Error");
  }
});
