// File: supabase/functions/metrics_activity_feed/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { verifyJWT } from "../_shared/jwt.ts";
import { checkRateLimit, addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logInfo, logError } from "../_shared/logging.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const startTime = performance.now();
  const path = new URL(req.url).pathname;

  try {
    logInfo("metrics_activity_feed", "Request started", { path });

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    let store_id: string | null = null;

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

    const clientIp = req.headers.get("x-real-ip") || "unknown";
    const rate = await checkRateLimit(clientIp, store_id);
    if (!rate.allowed) {
      return addSecurityHeaders(returnJsonError(429, "Rate limit exceeded"), rate.headers);
    }

    const [ordersResult, customersResult] = await Promise.all([
      supabase
        .from("shopify_orders")
        .select("id, shopify_order_id, created_at, total_price")
        .eq("store_id", store_id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("shopify_customers")
        .select("id, email, created_at")
        .eq("store_id", store_id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    if (ordersResult.error || customersResult.error) {
      const error = ordersResult.error || customersResult.error;
      await logError("metrics_activity_feed", error, { store_id });
      return addSecurityHeaders(returnJsonError(500, "Failed to fetch activity data"));
    }

    const orders = ordersResult.data || [];
    const customers = customersResult.data || [];

    const activityFeed = [
      ...orders.map((o) => ({
        id: o.id,
        action: "New Order",
        details: `Order #${o.shopify_order_id} - $${o.total_price}`,
        time: o.created_at,
      })),
      ...customers.map((c) => ({
        id: c.id,
        action: "New Customer",
        details: `${c.email} signed up`,
        time: c.created_at,
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);

    logInfo("metrics_activity_feed", "Activity feed ready", {
      store_id,
      count: activityFeed.length,
      duration_ms: performance.now() - startTime,
    });

    return addSecurityHeaders(
      new Response(JSON.stringify(activityFeed), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...rate.headers,
        },
      })
    );
  } catch (err) {
    await logError("metrics_activity_feed", err, { path });
    return addSecurityHeaders(returnJsonError(500, "Internal Server Error"));
  }
});
