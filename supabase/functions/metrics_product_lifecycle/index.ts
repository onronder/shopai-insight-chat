// File: supabase/functions/metrics_product_lifecycle/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyJWT } from "../_shared/jwt.ts";
import { checkRateLimit, addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logInfo, logError } from "../_shared/logging.ts";
import "https://deno.land/x/dotenv/load.ts";

// Supabase admin client
const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const startTime = performance.now();
  const path = new URL(req.url).pathname;

  try {
    logInfo("metrics_product_lifecycle", "Request started", { path });

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    let store_id: string | null = null;

    // Try Supabase session
    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.id) store_id = user.id;
    } catch {
      store_id = null;
    }

    // Fallback to JWT
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

    // Fetch lifecycle data
    const { data, error } = await supabase
      .from("vw_product_lifecycle")
      .select("lifecycle_stage, product_count, revenue_share")
      .eq("store_id", store_id)
      .order("revenue_share", { ascending: false });

    if (error) {
      logError("metrics_product_lifecycle", error, { store_id });
      return addSecurityHeaders(returnJsonError(500, "Failed to fetch product lifecycle data"));
    }

    // Transform response
    const transformed = (data ?? []).map((item) => ({
      stage: item.lifecycle_stage || "Unknown",
      count: Number(item.product_count ?? 0),
      revenueShare: Number(item.revenue_share ?? 0)
    }));

    logInfo("metrics_product_lifecycle", "Request completed", {
      store_id,
      count: transformed.length,
      duration_ms: performance.now() - startTime
    });

    return addSecurityHeaders(
      new Response(JSON.stringify({ stages: transformed }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...rate.headers
        }
      })
    );
  } catch (err) {
    logError("metrics_product_lifecycle", err, { path });
    return addSecurityHeaders(returnJsonError(500, "Internal Server Error"));
  }
});
