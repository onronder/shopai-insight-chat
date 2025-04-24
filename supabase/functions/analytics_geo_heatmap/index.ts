// File: supabase/functions/analytics_geo_heatmap/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { verifyJWT } from "../_shared/jwt.ts";
import { addSecurityHeaders, returnJsonError, checkRateLimit } from "../_shared/security.ts";
import { logInfo, logError } from "../_shared/logging.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

// Initialize Supabase admin client
const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const startTime = performance.now();
  const path = new URL(req.url).pathname;

  try {
    logInfo("analytics_geo_heatmap", "Request started", { path });

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

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

    const { data, error } = await supabase
      .from("vw_sales_geo_enriched")
      .select("city, state, country, lat, lng, total_orders, total_revenue")
      .eq("store_id", store_id)
      .not("lat", "is", null)
      .not("lng", "is", null)
      .order("total_orders", { ascending: false })
      .limit(500);

    if (error) {
      logError("analytics_geo_heatmap", error, { store_id });
      return addSecurityHeaders(returnJsonError(500, "Failed to fetch geographic data"));
    }

    const response = (data ?? []).map(row => ({
      city: row.city,
      state: row.state,
      country: row.country,
      lat: row.lat,
      lng: row.lng,
      orders: row.total_orders,
      revenue: row.total_revenue
    }));

    logInfo("analytics_geo_heatmap", "Success", {
      store_id,
      count: response.length,
      duration_ms: performance.now() - startTime
    });

    return addSecurityHeaders(
      new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...rate.headers,
        },
      })
    );
  } catch (err) {
    logError("analytics_geo_heatmap", err, { path });
    return addSecurityHeaders(returnJsonError(500, "Internal Server Error"));
  }
});
