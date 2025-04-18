import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyJWT } from "../_shared/jwt.ts";
import { checkRateLimit, addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logInfo, logError } from "../_shared/logging.ts";
import "https://deno.land/x/dotenv/load.ts";

// Create Supabase client with service role
const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const startTime = performance.now();
  const path = new URL(req.url).pathname;

  try {
    logInfo("metrics_return_rates", "Request started", { path });

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    let store_id: string | null = null;

    // Try session-based first
    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.id) store_id = user.id;
    } catch {
      store_id = null;
    }

    // Fallback to verified JWT
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

    // Query from view
    const { data, error } = await supabase
      .from("vw_return_rates")
      .select("product_id, product_title, orders_count, returns_count, return_rate")
      .eq("store_id", store_id)
      .order("return_rate", { ascending: false })
      .limit(20);

    if (error) {
      logError("metrics_return_rates", error, { store_id });
      return addSecurityHeaders(returnJsonError(500, "Failed to fetch return rate data"));
    }

    // Transform to expected format for ReturnRateChart
    const transformed = (data ?? []).map(item => ({
      productId: item.product_id || "",
      product: item.product_title || "Unknown",
      returnRate: parseFloat(item.return_rate ?? 0),
      totalOrders: Number(item.orders_count ?? 0),
      returnedOrders: Number(item.returns_count ?? 0)
    }));

    logInfo("metrics_return_rates", "Request completed", {
      store_id,
      count: transformed.length,
      duration_ms: performance.now() - startTime
    });

    return addSecurityHeaders(new Response(JSON.stringify({ products: transformed }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...rate.headers
      }
    }));
  } catch (err) {
    logError("metrics_return_rates", err, { path });
    return addSecurityHeaders(returnJsonError(500, "Internal Server Error"));
  }
});
