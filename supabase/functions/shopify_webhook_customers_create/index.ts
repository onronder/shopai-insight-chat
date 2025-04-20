import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/dotenv/load.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logInfo, logError } from "../_shared/logging.ts";

serve(async (req) => {
  const startTime = performance.now();
  const path = new URL(req.url).pathname;

  try {
    logInfo("shopify_webhook_customers_create", "Webhook received", { path });

    const payload = await req.json();
    const shopifyDomain = req.headers.get("x-shopify-shop-domain") || "";

    const supabase = createClient(
      Deno.env.get("PROJECT_SUPABASE_URL")!,
      Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
    );

    // Identify store
    const { data: store, error: storeError } = await supabase
      .from("shopify_stores")
      .select("id")
      .eq("domain", shopifyDomain)
      .maybeSingle();

    if (storeError || !store) {
      logError("shopify_webhook_customers_create", storeError || "Store not found", { shopifyDomain });
      return addSecurityHeaders(returnJsonError(404, "Store not found"));
    }

    const customerData = {
      shopify_customer_id: payload.id?.toString(),
      email: payload.email || null,
      first_name: payload.first_name || null,
      last_name: payload.last_name || null,
      phone: payload.phone || null,
      verified_email: payload.verified_email ?? null,
      store_id: store.id,
      source_updated_at: payload.updated_at ? new Date(payload.updated_at) : null,
      shopify_synced_at: new Date()
    };

    const { error: upsertError } = await supabase
      .from("shopify_customers")
      .upsert(customerData)
      .select("id")
      .single();

    if (upsertError) {
      logError("shopify_webhook_customers_create", upsertError.message, {
        customer_id: payload.id,
        store_id: store.id
      });

      return addSecurityHeaders(returnJsonError(500, "Upsert failed"));
    }

    await supabase.from("webhook_logs").insert({
      store_id: store.id,
      topic: "customers/create",
      shopify_customer_id: payload.id?.toString(),
      payload,
    });

    logInfo("shopify_webhook_customers_create", "Customer created or updated", {
      store_id: store.id,
      shopify_customer_id: payload.id?.toString()
    });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError("shopify_webhook_customers_create", err, { path });
    return addSecurityHeaders(returnJsonError(500, "Webhook Error"));
  } finally {
    const duration = performance.now() - startTime;
    logInfo("shopify_webhook_customers_create", "Completed", { path, duration });
  }
});
