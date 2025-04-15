// File: supabase/functions/shopify_webhook_orders_create/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createHmac } from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { logInfo, logError } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";

import "https://deno.land/x/dotenv/load.ts";

const SUPABASE_URL = Deno.env.get("PROJECT_SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!;
const SHOPIFY_API_SECRET = Deno.env.get("PROJECT_SHOPIFY_API_SECRET")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

serve(async (req) => {
  const start = performance.now();
  const path = new URL(req.url).pathname;

  try {
    const rawBody = await req.text();
    const shopifyDomain = req.headers.get("X-Shopify-Shop-Domain") || "";
    const hmacHeader = req.headers.get("X-Shopify-Hmac-Sha256") || "";

    // Verify HMAC Signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SHOPIFY_API_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(rawBody)
    );
    const generatedHmac = btoa(String.fromCharCode(...new Uint8Array(signature)));

    if (generatedHmac !== hmacHeader) {
      logError("shopify_webhook_orders_create", "Invalid HMAC", { shopifyDomain });
      return returnJsonError(401, "Unauthorized");
    }

    const payload = JSON.parse(rawBody);
    const orderId = payload?.id;

    // Log webhook
    const { error } = await supabase.from("webhook_logs").insert({
      store_domain: shopifyDomain,
      topic: "orders/create",
      shopify_order_id: orderId,
      payload,
    });

    if (error) {
      logError("shopify_webhook_orders_create", error, { shopifyDomain, orderId });
      return returnJsonError(500, "Failed to log webhook");
    }

    logInfo("shopify_webhook_orders_create", "Webhook received", {
      shopifyDomain,
      orderId,
    });

    const duration = performance.now() - start;
    logInfo("shopify_webhook_orders_create", "Request completed", {
      path,
      duration_ms: duration,
    });

    return addSecurityHeaders(new Response("OK", { status: 200 }));
  } catch (err) {
    logError("shopify_webhook_orders_create", err, { path });
    return returnJsonError(500, "Webhook Error");
  }
});
