// File: supabase/functions/shopify_webhook_customers_delete/index.ts

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

    logInfo("shopify_webhook_customers_delete", "Webhook received", {
      path,
      shopifyDomain,
    });

    const { data: store, error: storeError } = await supabase
      .from("shopify_stores")
      .select("id")
      .eq("domain", shopifyDomain)
      .maybeSingle();

    if (storeError || !store) {
      logError("shopify_webhook_customers_delete", storeError || "Store not found", {
        shopifyDomain,
      });
      return returnJsonError(404, "Store not found");
    }

    const shopify_customer_id = payload.id?.toString();
    if (!shopify_customer_id) {
      return returnJsonError(400, "Missing customer ID");
    }

    await supabase
      .from("shopify_customers")
      .update({ is_deleted: true })
      .eq("shopify_customer_id", shopify_customer_id)
      .eq("store_id", store.id);

    await supabase.from("webhook_logs").insert({
      store_id: store.id,
      topic: "customers/delete",
      shopify_customer_id,
      payload,
    });

    logInfo("shopify_webhook_customers_delete", "Customer marked as deleted", {
      store_id: store.id,
      shopify_customer_id,
    });

    const duration = performance.now() - start;
    logInfo("shopify_webhook_customers_delete", "Completed", { duration });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError("shopify_webhook_customers_delete", err, { path });
    return returnJsonError(500, "Webhook Error");
  }
});
