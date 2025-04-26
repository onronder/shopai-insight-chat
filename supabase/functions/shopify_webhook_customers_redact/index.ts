// File: /supabase/functions/shopify_webhook_customers_redact/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyShopifyHMAC } from "../_shared/verifyHMAC.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logInfo, logError } from "../_shared/logging.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const SHOPIFY_API_SECRET = Deno.env.get("PROJECT_SHOPIFY_API_SECRET")!;
const context = "shopify_webhook_customers_redact";

serve(async (req) => {
  const path = new URL(req.url).pathname;
  const start = performance.now();

  try {
    const rawBody = await req.text();
    const hmac = req.headers.get("x-shopify-hmac-sha256") || "";

    const valid = await verifyShopifyHMAC(rawBody, hmac, SHOPIFY_API_SECRET);
    if (!valid) {
      logError(context, "Invalid HMAC signature", { path });
      return returnJsonError(401, "Unauthorized");
    }

    const payload = JSON.parse(rawBody);
    const customerId = payload.customer?.id;
    const shopDomain = payload.shop_domain;

    logInfo(context, "Received customer data erasure request", { customerId, shopDomain });

    // ⚡ OPTIONAL: In the future, delete customer-specific records from your database if you store any.
    // For now, Shopify expects only a 200 OK response.

    return addSecurityHeaders(new Response("OK", { status: 200 }));

  } catch (error) {
    logError(context, error, { path });
    return returnJsonError(500, "Unexpected server error");
  } finally {
    logInfo(context, "Webhook processed", { duration_ms: performance.now() - start });
  }
});
