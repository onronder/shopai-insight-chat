// File: supabase/functions/analytics_funnel/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { verifyJWT } from "../_shared/jwt.ts";
import { checkRateLimit, addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logInfo, logError } from "../_shared/logging.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

// Supabase admin client
const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const startTime = performance.now();
  const path = new URL(req.url).pathname;

  try {
    logInfo("analytics_funnel", "Request started", { path });

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    let store_id: string | null = null;

    // Attempt to extract store ID from Supabase session or fallback to JWT
    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.id) store_id = user.id;
    } catch {
      store_id = null;
    }

    if (!store_id && token) {
      const verified = await verifyJWT(token);
      if (verified?.sub) store_id = verified.sub;
    }

    if (!store_id) {
      return addSecurityHeaders(returnJsonError(401, "Unauthorized"));
    }

    // Enforce rate limiting
    const clientIp = req.headers.get("x-real-ip") || "unknown";
    const rate = await checkRateLimit(clientIp, store_id);
    if (!rate.allowed) {
      return addSecurityHeaders(returnJsonError(429, "Rate limit exceeded"), rate.headers);
    }

    // Fetch orders data for funnel metrics
    const { data: orders, error } = await supabase
      .from("shopify_orders")
      .select("financial_status, fulfillment_status")
      .eq("store_id", store_id)
      .is("is_deleted", false);

    if (error) {
      logError("analytics_funnel", error.message, { store_id });
      return addSecurityHeaders(returnJsonError(500, "Failed to fetch orders for funnel"));
    }

    // Construct funnel stages
    const funnelStages = {
      placed: 0,
      paid: 0,
      fulfilled: 0
    };

    for (const order of orders ?? []) {
      funnelStages.placed++;

      if (
        order.financial_status &&
        ["paid", "partially_paid", "authorized"].includes(order.financial_status)
      ) {
        funnelStages.paid++;
      }

      if (
        order.fulfillment_status &&
        ["fulfilled", "shipped"].includes(order.fulfillment_status)
      ) {
        funnelStages.fulfilled++;
      }
    }

    const funnel = [
      { label: "Orders Placed", count: funnelStages.placed },
      { label: "Paid Orders", count: funnelStages.paid },
      { label: "Fulfilled Orders", count: funnelStages.fulfilled }
    ];

    logInfo("analytics_funnel", "Funnel generated", {
      store_id,
      duration_ms: performance.now() - startTime,
      records: funnel.length
    });

    return addSecurityHeaders(
      new Response(JSON.stringify(funnel), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...rate.headers,
        },
      })
    );
  } catch (err) {
    logError("analytics_funnel", err, { path });
    return addSecurityHeaders(returnJsonError(500, "Internal Server Error"));
  }
});
